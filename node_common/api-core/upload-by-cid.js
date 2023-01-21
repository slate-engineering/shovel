import * as Data from "~/node_common/data";
import * as LibraryManager from "~/node_common/managers/library";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as RequestUtilities from "~/node_common/request-utilities";

import AbortController from "abort-controller";
import fetch from "node-fetch";
import fs from "fs";

const SHOVEL = "RENDER->TEXTILE ";

export const uploadByCid = async (req, res) => {
  const userInfo = await RequestUtilities.checkAuthorizationExternal(req, res);
  if (!userInfo) return;
  const { user } = userInfo;

  const cid = req.body.data?.cid;
  const filename = req.body.data?.filename;

  if (Strings.isEmpty(cid)) {
    res.status(400).json({
      decorator: "NO_CID_PROVIDED",
      error: true,
    });
    return;
  }

  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid });
  if (duplicateFile) {
    return duplicateFile;
  }

  const url = Strings.getURLfromCID(cid);

  let data = LibraryManager.createLocalDataIncomplete({ name: filename || cid });

  data.cid = cid;

  const location = `/tmp/${data.id}`;

  try {
    await writeStreamToDisk({ url, data, location });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
    res.status(500).json({
      decorator: e?.decorator || "UPLOAD_WRITE_TO_DISK_ERROR",
      error: true,
      message: e?.message || "We ran into an issue while writing the file to disk",
    });
    return;
  }

  let fileStats = fs.statSync(location);
  data.size = fileStats.size;

  fs.unlink(location, (e) => {
    if (e) {
      ScriptLogging.error(SHOVEL, `Error while deleting ${location}: ${e.message}`);
    }
    ScriptLogging.message(SHOVEL, `${location} was deleted`);
  });

  const createResponse = await Data.createFile({ owner: user, files: data });

  if (!createResponse) {
    res.status(404).send({ decorator: "CREATE_FILE_FAILED", error: true });
    return;
  }

  if (createResponse.error) {
    res.status(500).send({ decorator: createResponse.decorator, error: true });
    return;
  }

  return data;
};

const writeStreamToDisk = async ({ url, data, location }) => {
  return new Promise(async (resolve, reject) => {
    let r;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);

      r = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
    } catch (e) {
      console.log(e);
    }

    if (!r || r.status !== 200) {
      return reject({
        error: true,
        decorator: "UPLOAD_PULL_FILE_FROM_CID_ERROR",
        message: `Could not locate a file on the network with the provided cid`,
      });
    }

    data.type = r.headers.get("content-type");

    const destination = fs.createWriteStream(location);

    r.body.pipe(destination);
    r.body.on("end", () => {
      ScriptLogging.message(SHOVEL, `Finished writing to disk at ${location}`);
      resolve({ path: location });
    });
    r.body.on("error", (e) =>
      reject({
        error: true,
        decorator: "UPLOAD_WRITE_TO_DISK_ERROR",
        message: `Error while writing to disk: ${e}`,
      })
    );
  });
};
