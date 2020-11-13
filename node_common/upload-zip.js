import * as LibraryManager from "~/node_common/managers/library";
import * as Utilities from "~/node_common/utilities";
import * as Social from "~/node_common/social";

import iterateStream from "~/node_common/iterateStream";
import unzipper from "unzipper";

import B from "busboy";

const UPLOAD = "UPLOADING       ";
const SHOVEL = "RENDER->TEXTILE ";
const POST = "POST PROCESS    ";
const HIGH_WATER_MARK = 1024 * 1024 * 3;

const unZip = async (stream, onEntry) => {
  const zip = stream.pipe(unzipper.Parse({ forceStream: true, verbose: true }));

  for await (const entry of iterateStream(zip)) {
    const fileName = entry.path;
    console.log("unzippy", fileName);
    const type = entry.type;
    if (type === "File") {
      await onEntry(entry, fileName);
    } else {
      entry.autodrain();
    }
  }
};

export const formMultipart = async (req, res, { user, bucketName }) => {
  const { buckets, bucketKey } = await Utilities.getBucketAPIFromUserToken({
    user,
    bucketName,
  });

  let data;
  const upload = () =>
    new Promise(async (resolve, reject) => {
      let form = new B({
        headers: req.headers,
        highWaterMark: HIGH_WATER_MARK,
        fileHwm: HIGH_WATER_MARK,
      });

      form.on("file", async function (fieldname, stream, filename, encoding, mime) {
        data = LibraryManager.createLocalDataIncomplete({
          name: filename,
          type: mime,
        });

        await unZip(stream, async (entry, fileName) => {
          if (!buckets) {
            return reject({
              decorator: "SERVER_BUCKET_INIT_FAILURE",
              error: true,
            });
          }

          try {
            console.log("[upload] pushing to textile", fileName);
            const push = await buckets.pushPath(
              bucketKey,
              `${data.id}/${fileName}`,
              {
                path: `${data.id}/${fileName}`,
                content: entry,
              },
              {
                progress: (num) => console.log(`${fileName} Progress`, num),
              }
            );
            console.log("[upload] finished pushing to textile", push);
          } catch (e) {
            console.log("ERROR HAPPENED AT UPLOAD FILES", e);
            Social.sendTextileSlackMessage({
              file: "/node_common/upload.js",
              user,
              message: e.message,
              code: e.code,
              functionName: `buckets.pushPath`,
            });

            return reject({
              decorator: "SERVER_UPLOAD_ERROR",
              error: true,
              message: e.message,
            });
          }
        });
      });

      form.on("finish", async () => {
        try {
          const {
            item: { path },
          } = await buckets.listPath(bucketKey, data.id);
          console.log("ALL FILES UPLOAD", path);
          return resolve({
            decorator: "SERVER_BUCKET_STREAM_SUCCESS",
            data: path,
          });
        } catch (e) {
          console.log("ERROR HAPPENED ON FINISH EVENT", e);
        }
      });

      form.on("error", (e) => {
        Social.sendTextileSlackMessage({
          file: "/node_common/upload.js",
          user,
          message: e.message,
          code: e.code,
          functionName: `form`,
        });

        return reject({
          decorator: "SERVER_UPLOAD_ERROR",
          error: true,
          message: e.message,
        });
      });
      req.pipe(form);
    });

  const response = await upload();

  console.log("[ upload ]", response);
  if (response && response.error) {
    console.log("[ upload ] ending due to errors.", e);
    return response;
  }

  if (!buckets) {
    return {
      decorator: "SERVER_BUCKET_INIT_FAILURE",
      error: true,
    };
  }

  try {
    const newUpload = await buckets.listIpfsPath(response.data);
    data.size = newUpload.size;
  } catch (e) {
    Social.sendTextileSlackMessage({
      file: "/node_common/upload.js",
      user,
      message: e.message,
      code: e.code,
      functionName: `buckets.listIpfsPath`,
    });

    return {
      decorator: "SERVER_UPLOAD_ERROR",
      error: true,
      message: e.message,
    };
  }

  return { decorator: "SERVER_UPLOAD_SUCCESS", data, ipfs: response.data };
};
