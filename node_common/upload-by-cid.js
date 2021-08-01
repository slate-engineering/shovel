import * as LibraryManager from "~/node_common/managers/library";
import * as Utilities from "~/node_common/utilities";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Strings from "~/common/strings";

import fetch from "node-fetch";
import fs from "fs";

const SHOVEL = "RENDER->TEXTILE ";

export async function upload(req, res, { cid, user, bucketName }) {
  let { buckets, bucketKey, bucketRoot } = await Utilities.getBucketAPIFromUserToken({
    user,
    bucketName,
  });

  if (!buckets) {
    ScriptLogging.error(SHOVEL, `Utilities.getBucketAPIFromUserToken()`);
    res.set("Connection", "close");
    return {
      decorator: "UPLOAD_NO_BUCKETS",
      error: true,
      message: `No buckets for ${user.username}.`,
    };
  }

  const url = Strings.getURLfromCID(cid);

  let data = LibraryManager.createLocalDataIncomplete({ name: cid });

  data.cid = cid;

  const location = `/tmp/${data.id}`;

  const writeStreamToDisk = async (url) => {
    return new Promise((resolve, reject) => {
      fetch(url).then((r) => {
        data.data.type = r.headers.get("content-type");

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
    });
  };

  try {
    await writeStreamToDisk(url);
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
    return e;
  }

  let fileStats = fs.statSync(location);
  data.data.size = fileStats.size;

  fs.unlink(location, (e) => {
    if (e) {
      ScriptLogging.error(SHOVEL, `Error while deleting ${location}: ${e.message}`);
    }
    ScriptLogging.message(SHOVEL, `${location} was deleted`);
  });

  let response = await Utilities.addExistingCIDToData({
    buckets,
    key: bucketKey,
    path: bucketRoot.path,
    cid,
  });

  if (!response || response.error) {
    return res.status(400).send({ decorator: "ERROR_WHILE_SAVING_FILE", error: true });
  }

  return { decorator: "UPLOAD_SUCCESS", data };
}