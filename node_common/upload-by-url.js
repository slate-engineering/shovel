import * as LibraryManager from "~/node_common/managers/library";
import * as Utilities from "~/node_common/utilities";
import * as Social from "~/node_common/social";
import * as NodeConstants from "~/node_common/constants";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Strings from "~/common/strings";

import fetch from "node-fetch";
import fs from "fs";

const UPLOAD = "UPLOADING       ";
const SHOVEL = "RENDER->TEXTILE ";
const POST = "POST PROCESS    ";
const HIGH_WATER_MARK = 1024 * 1024 * 3;

export async function upload(req, res, { url, user, bucketName }) {
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

  let filename = Strings.getFilenameFromURL(url);
  let data = LibraryManager.createLocalDataIncomplete({
    name: filename,
  });

  const location = `/tmp/${data.id}`;

  const writeStreamToDisk = async (url) => {
    return new Promise((resolve, reject) => {
      fetch(url).then((r) => {
        data.data.type = r.headers.get("content-type");
        let size = r.headers.get("content-length");
        if (size) {
          data.data.size = size;
        }

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

  if (!data.data.size) {
    let fileStats = fs.statSync(location);
    data.data.size = fileStats.size;
  }

  let dataPath = null;

  const readStream = fs.createReadStream(location);

  const _createStreamAndUploadToTextile = async (readableStream) => {
    return new Promise(function (resolvePromiseFn, rejectPromiseFn) {
      readableStream.on("open", async (fd) => {
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
            console.log(
              `LOOK HERE: throwing error at spot 1 in upload.js with message ${e.message}`
            );
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

  let response;
  try {
    response = await _createStreamAndUploadToTextile(readStream);
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
    return e;
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

  return { decorator: "UPLOAD_SUCCESS", data };
}
