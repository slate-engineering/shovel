import archiver from "archiver";
import Request from "request";
import Redis from "ioredis";
import * as Environment from "~/node_common/environment";

const redisClient = new Redis({
  port: Environment.REDIS_PORT,
  host: Environment.REDIS_HOST,
  password: Environment.REDIS_PASSWORD,
});

const request = (link) => Request.get(link);

const DOWNLOAD_ERROR_MESSAGE = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<script>
          parent.postMessage('SLATE_DOWNLOAD_ERROR','${Environment.RESOURCE_URI_SLATE}');
    </script>
	</head>
	<body></body>
</html>`;

const archiveAndDownload = ({ fileName, files }, res) =>
  new Promise((resolve, reject) => {
    const archive = archiver("zip");
    archive.on("error", (err) => reject(err));
    archive.on("end", () => resolve());
    res.attachment(fileName);
    archive.pipe(res);
    files.forEach((file) =>
      archive.append(
        request(file.url).on("error", (err) => reject(err)),
        { name: file.name }
      )
    );
    archive.finalize();
  });

export default async (req, res) => {
  try {
    const downloadId = req.query.downloadId;
    const fileName = req.query.name;
    let files = [];
    files = JSON.parse(await redisClient.get(downloadId));
    if (!files)
      return res.status(400).header("Content-Type", "text/html").send(DOWNLOAD_ERROR_MESSAGE);
    await archiveAndDownload({ fileName, files }, res);
    redisClient.del(downloadId);
  } catch (e) {
    return res.status(404).end();
  }
};

// export default async (req, res) => {
//   const downloadId = req.query.downloadId;
//   const fileName = req.query.name;
//   let files = [];

//   try {
//     files = JSON.parse(await redisClient.get(downloadId));
//     if (!files) throw new Error("invalid files");
//   } catch (e) {
//     console.log(e);
//     return res.status(400).header("Content-Type", "text/html").send(DOWNLOAD_ERROR_MESSAGE);
//   }

//   const archive = archiver("zip");

//   try {
//     archive.on("warning", function (err) {
//       if (err.code === "ENOENT") {
//         console.log("download warning", err);
//       } else {
//         // throw error
//         throw err;
//       }
//     });

//     archive.on("error", function (err) {
//       throw err;
//     });

//     res.attachment(fileName);
//     archive.pipe(res);
//     files.forEach((file) => archive.append(request(file.url), { name: file.name }));
//     archive.finalize();
//     redisClient.del(downloadId);
//   } catch (e) {
//     console.log(e);
//     return res.status(500).header("Content-Type", "text/html").send(DOWNLOAD_ERROR_MESSAGE);
//   }
// };
