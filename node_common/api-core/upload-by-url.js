import * as Data from "~/node_common/data";
import * as Constants from "~/node_common/constants";
import * as LibraryManager from "~/node_common/managers/library";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as RequestUtilities from "~/node_common/request-utilities";
import * as Utilities from "~/node_common/utilities";

import AbortController from "abort-controller";
import fetch from "node-fetch";
import fs from "fs";

const UPLOAD = "UPLOADING       ";
const SHOVEL = "RENDER->TEXTILE ";
const POST = "POST PROCESS    ";
const HIGH_WATER_MARK = 1024 * 1024 * 3;

export const uploadByUrl = async (req, res, internal = false) => {
  let userInfo;
  if (internal) {
    userInfo = await RequestUtilities.checkAuthorizationInternal(req, res);
  } else {
    userInfo = await RequestUtilities.checkAuthorizationExternal(req, res);
  }
  if (!userInfo) return;
  const { id, key, user } = userInfo;

  const url = req.body.data?.url;
  const filename = req.body.data?.filename;

  if (Strings.isEmpty(url)) {
    res.status(400).json({
      decorator: "SERVER_URL_MISSING",
      error: true,
    });
    return;
  }

  let { buckets, bucketKey, bucketRoot } = await Utilities.getBucketAPIFromUserToken({ user });

  if (!buckets) {
    ScriptLogging.error(SHOVEL, `Utilities.getBucketAPIFromUserToken()`);
    res.set("Connection", "close");
    res.status(500).json({
      decorator: "UPLOAD_NO_BUCKETS",
      error: true,
      message: `No buckets for ${user.username}.`,
    });
    return;
  }

  let data = LibraryManager.createLocalDataIncomplete({
    name: filename || Strings.getFilenameFromURL(url) || "unnamed_file",
  });

  const location = `/tmp/${data.id}`;

  try {
    await writeStreamToDisk({ url, data, location });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e?.message);
    res.status(500).json({
      decorator: e?.decorator || "UPLOAD_WRITE_TO_DISK_ERROR",
      error: true,
      message: e?.message || "We ran into an issue while writing the file to disk",
    });
    return;
  }

  if (!data.size) {
    let fileStats = fs.statSync(location);
    data.size = fileStats.size;
  }

  const readStream = fs.createReadStream(location);

  let response;
  try {
    response = await _createStreamAndUploadToTextile({
      readableStream: readStream,
      data,
      buckets,
      bucketKey,
      bucketRoot,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
    res.status(500).json({
      decorator: "SERVER_UPLOAD_ERROR",
      error: true,
      message: "We ran into an issue while uploading that file to textile",
    });
    return;
  } finally {
    fs.unlink(location, (e) => {
      if (e) {
        ScriptLogging.error(SHOVEL, `Error while deleting ${location}: ${e.message}`);
      }
      ScriptLogging.message(SHOVEL, `${location} was deleted`);
    });
  }

  data.cid = response.data.replace("/ipfs/", "");

  ScriptLogging.message(POST, `SUCCESS !!! data: ${data}`);

  let updatedFile;
  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid: data.cid });

  if (!duplicateFile) {
    const response = await Data.createFile({ owner: user, files: data });

    if (!response) {
      res.status(404).send({ decorator: "CREATE_FILE_FAILED", error: true });
      return;
    }

    if (response.error) {
      res.status(500).send({ decorator: response.decorator, error: true });
      return;
    }

    updatedFile = response;
  } else {
    updatedFile = duplicateFile;
  }

  return updatedFile;
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
        decorator: "UPLOAD_PULL_FILE_FROM_URL_ERROR",
        message: `Could not locate a file at the provided url`,
      });
    }

    data.type = r.headers.get("content-type");
    let size = r.headers.get("content-length");
    if (size) {
      data.size = parseInt(size);
    }

    const destination = fs.createWriteStream(location);

    r.body.pipe(destination);
    r.body.on("end", () => {
      ScriptLogging.message(SHOVEL, `Finished writing to disk at ${location}`);
      resolve({ path: location });
      return;
    });
    r.body.on("error", (e) => {
      reject({
        error: true,
        decorator: "UPLOAD_WRITE_TO_DISK_ERROR",
        message: `Error while writing to disk: ${e}`,
      });
      return;
    });
  });
};

const _createStreamAndUploadToTextile = async ({
  readableStream,
  data,
  buckets,
  bucketKey,
  bucketRoot,
}) => {
  return new Promise(function (resolvePromiseFn, rejectPromiseFn) {
    readableStream.on("open", async (fd) => {
      let dataPath;
      let push = await buckets
        .pushPath(bucketKey, data.id, readableStream, {
          root: bucketRoot,
          // signal,
          progress: function (num) {
            if (num % (HIGH_WATER_MARK * 5) !== 0) {
              return;
            }

            ScriptLogging.progress(SHOVEL, `${timeoutId} : ${Strings.bytesToSize(num)}`);
          },
        })
        .catch(function (e) {
          console.log(`LOOK HERE: throwing error at spot 1 in upload.js with message ${e.message}`);
          return rejectPromiseFn({
            error: true,
            decorator: "UPLOAD_PUSH_PATH_ERROR",
            message: e.message,
          });
        });
      dataPath = push.path.path;

      readableStream.unpipe();

      if (Strings.isEmpty(dataPath)) {
        return rejectPromiseFn({
          error: true,
          decorator: "UPLOAD_TEXTILE_RESPONSE_MISSING_DATA",
          message: "Upload to textile missing textile URL data in response",
        });
      }

      ScriptLogging.message(SHOVEL, `uploaded data path : ${dataPath}`);
      return resolvePromiseFn({
        decorator: "UPLOAD_STREAM_SUCCESS",
        data: dataPath,
      });
    });

    readableStream.on("error", (e) => {
      console.log(`LOOK HERE: throwing error at spot 2 in upload.js with message ${e.message}`);
      return rejectPromiseFn({
        error: true,
        decorator: "UPLOAD_READABLE_STREAM_ERROR",
        message: e.message,
      });
    });
  });
};
