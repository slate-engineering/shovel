import * as LibraryManager from "~/node_common/managers/library";
import * as Utilities from "~/node_common/utilities";
import * as Social from "~/node_common/social";
import * as NodeConstants from "~/node_common/constants";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Strings from "~/common/strings";

import AbortController from "abort-controller";
import BusBoyConstructor from "busboy";
import Queue from "p-queue";
import concat from "concat-stream";
import unzipper from "unzipper";

const UPLOAD = "UPLOADING       ";
const UPLOADED = "UPLOADED        ";
const SHOVEL = "RENDER->TEXTILE ";
const POST = "POST PROCESS    ";
const HIGH_WATER_MARK = 1024 * 1024 * 3;

export async function formMultipart(req, res, { user, bucketName, originalFileName }) {
  const singleConcurrencyQueue = new Queue({ concurrency: 1 });
  const controller = new AbortController();
  const heapSize = Strings.bytesToSize(process.memoryUsage().heapUsed);
  const uploadSizeBytes = req.headers["content-length"];
  const timeoutMap = {};

  const { signal } = controller;

  let data = null;
  let dataPath = null;

  if (!Strings.isEmpty(originalFileName)) {
    ScriptLogging.log(UPLOAD, `${user.username} is pushing ${originalFileName}`);
  } else {
    ScriptLogging.log(UPLOAD, `${user.username} is using the API`);
  }

  ScriptLogging.message(UPLOAD, `heap size : ${heapSize}`);
  ScriptLogging.message(UPLOAD, `upload size : ${Strings.bytesToSize(uploadSizeBytes)}`);

  if (uploadSizeBytes > NodeConstants.TEXTILE_BUCKET_LIMIT) {
    ScriptLogging.error(SHOVEL, `Too large !!!`);
    res.set("Connection", "close");
    return {
      decorator: "UPLOAD_SIZE_TOO_LARGE",
      error: true,
    };
  }

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

  let bucketSizeBytes = null;
  try {
    const path = await buckets.listPath(bucketKey, "/");
    bucketSizeBytes = path.item.size;
  } catch (e) {
    res.set("Connection", "close");
    return {
      decorator: "UPLOAD_BUCKET_CHECK_FAILED",
      error: true,
    };
  }

  let remainingSizeBytes = NodeConstants.TEXTILE_BUCKET_LIMIT - bucketSizeBytes;
  ScriptLogging.message(UPLOAD, `bucket size bytes : ${bucketSizeBytes}`);
  ScriptLogging.message(UPLOAD, `remaining size bytes : ${remainingSizeBytes}`);

  if (uploadSizeBytes > remainingSizeBytes) {
    res.set("Connection", "close");
    return {
      decorator: "UPLOAD_NOT_ENOUGH_SPACE_REMAINS",
      error: true,
    };
  }

  const busboy = new BusBoyConstructor({
    headers: req.headers,
    highWaterMark: HIGH_WATER_MARK,
  });

  const _createStreamAndUploadToTextile = async (writableStream) => {
    return new Promise(function (resolvePromiseFn, rejectPromiseFn) {
      function _safeForcedSingleConcurrencyFn(actionFn, rejectFn, timeoutId) {
        singleConcurrencyQueue.add(async function () {
          try {
            await actionFn();
          } catch (e) {
            ScriptLogging.error(SHOVEL, `${timeoutId} : queue.pause()`);
            singleConcurrencyQueue.pause();

            ScriptLogging.error(SHOVEL, `${timeoutId} : controller.abort()`);
            controller.abort();

            ScriptLogging.error(SHOVEL, `${timeoutId} : sendTextileSlackMessage()`);
            Social.sendTextileSlackMessage({
              file: "/node_common/upload.js",
              user,
              message: e.message,
              code: e.code,
              functionName: `${timeoutId} : _safeForcedSingleConcurrencyFn()`,
            });

            ScriptLogging.error(SHOVEL, `${timeoutId} : req.unpipe()`);
            req.unpipe();

            ScriptLogging.error(
              SHOVEL,
              `${timeoutId} : rejectFn() of safeForcedSingleConcurrencyFn()`
            );

            return rejectFn({
              decorator: "UPLOAD_FAILURE",
              error: true,
              message: e.message,
              id: timeoutId,
            });
          }
        });
      }

      writableStream.on("file", function (fieldname, stream, filename, encoding, mime) {
        const timeoutId = `${user.username}-${filename}`;

        data = LibraryManager.createLocalDataIncomplete({
          name: filename,
          type: mime,
        });

        const concatStream = concat(_handleZipUpload);
        stream.pipe(concatStream);

        // (NOTE: daniel) extract and upload files
        async function _handleZipUpload(buffer) {
          const { files } = await unzipper.Open.buffer(buffer);

          let push;

          for (const file of files) {
            if (file.type === "File") {
              let fileName = file.path;
              let entry = file.stream();

              push = await buckets
                .pushPath(
                  bucketKey,
                  `${data.id}/${fileName}`,
                  {
                    path: `${data.id}/${fileName}`,
                    content: entry,
                  },
                  {
                    signal,
                    progress: function (num) {
                      if (num % (HIGH_WATER_MARK * 5) !== 0) {
                        return;
                      }

                      ScriptLogging.progress(SHOVEL, `${timeoutId} : ${Strings.bytesToSize(num)}`);
                    },
                  }
                )
                .catch(function (e) {
                  console.error(e);
                  throw new Error(e.message);
                });

              ScriptLogging.message(UPLOADED, `uploaded ${fileName} to root: ${push.root}`);
            }
          }

          ScriptLogging.message(SHOVEL, `upload finished ...`);

          dataPath = push.root;

          if (Strings.isEmpty(dataPath)) {
            return rejectPromiseFn({
              decorator: "UPLOAD_FAILURE",
              error: true,
              message: "Missing Textile URL data.",
            });
          }

          ScriptLogging.message(SHOVEL, `uploaded data path : ${dataPath}`);

          req.unpipe();
          ScriptLogging.message(SHOVEL, `${timeoutId} : req.unpipe()`);

          return resolvePromiseFn({
            decorator: "UPLOAD_STREAM_SUCCESS",
            data: dataPath,
          });
        }
      });

      writableStream.on("error", function (e) {
        return _safeForcedSingleConcurrencyFn(() => {
          throw new Error(e.message);
        }, rejectPromiseFn);
      });

      ScriptLogging.message(SHOVEL, `req.pipe(writableStream)`);
      req.pipe(writableStream);
    });
  };

  let response = null;
  try {
    response = await _createStreamAndUploadToTextile(busboy);
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
    res.set("Connection", "close");

    return response;
  }

  ScriptLogging.message(SHOVEL, `stream complete ...`);
  if (response && response.error) {
    res.set("Connection", "close");

    return response;
  }

  ScriptLogging.message(POST, `non-essential Utilities.getBucketAPIFromuserToken()`);
  let refreshed = await Utilities.getBucketAPIFromUserToken({
    user,
    bucketName,
  });

  if (!refreshed.buckets) {
    ScriptLogging.error(POST, `Utilities.getBucketAPIFromuserToken() failed`);
    return {
      decorator: "UPLOAD_FAILURE",
      error: true,
    };
  }

  try {
    const newUpload = await refreshed.buckets.listIpfsPath(response.data);
    data.size = newUpload.size;

    ScriptLogging.message(POST, `${data.name} : ${Strings.bytesToSize(data.size)} uploaded`);
  } catch (e) {
    Social.sendTextileSlackMessage({
      file: "/node_common/upload.js",
      user,
      message: e.message,
      code: e.code,
      functionName: `refreshed.buckets.listIpfsPath`,
    });

    return {
      decorator: "UPLOAD_VERIFY_FAILURE",
      error: true,
      message: e.message,
    };
  }

  ScriptLogging.message(POST, `SUCCESS !!!`);
  return { decorator: "UPLOAD_SUCCESS", data, ipfs: `${response.data}/${data.id}/index.html` };
}
