import * as Environment from "~/node_common/environment";
import * as ScriptLogging from "~/node_common/script-logging";

import APIRouteIndex from "~/pages";
import APIRouteUpload from "~/pages/upload";
import APIRouteUploadExternalV1 from "~/pages/v1/external-upload";
import APIRouteSlateUploadExternalV1 from "~/pages/v1/external-slate-upload";
import APIRouteUploadExternalV2 from "~/pages/v2/external-upload";
import APIRouteSlateUploadExternalV2 from "~/pages/v2/external-slate-upload";
import APIRouteUploadExternalV3 from "~/pages/v3/external-upload";
import APIRouteSlateUploadExternalV3 from "~/pages/v3/external-slate-upload";
import APIRouteUploadZip from "~/pages/upload-zip";
import APICreateZipToken from "~/pages/create-zip-token";
import APIDownloadByToken from "~/pages/download-by-token";
import APIRouteUploadUrl from "~/pages/upload-by-url";
import APIRouteUploadCidExternalV2 from "~/pages/v2/external-upload-by-cid";
import APIRouteUploadUrlExternalV2 from "~/pages/v2/external-upload-by-url";
import APIRouteUploadCidExternalV3 from "~/pages/v3/external-upload-by-cid";
import APIRouteUploadUrlExternalV3 from "~/pages/v3/external-upload-by-url";

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const server = express();
const SHOVEL = "SERVER START    ";

server.use(cors());

server.use(bodyParser.json());

server.get("/favicon.ico", (req, res) => res.status(204));

server.get("/", async (req, res) => {
  return await APIRouteIndex(req, res);
});

server.post("/api/public", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadExternalV1(req, res);
});

server.post("/api/public/:slate", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteSlateUploadExternalV1(req, res);
});

/* v2 endpoints */

server.post("/api/v2/public", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadExternalV2(req, res);
});

server.post("/api/v2/public/upload-by-cid", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadCidExternalV2(req, res);
});

server.post("/api/v2/public/upload-by-url", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadUrlExternalV2(req, res);
});

server.post("/api/v2/public/:slate", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteSlateUploadExternalV2(req, res);
});

/* v3 endpoints */

server.post("/api/v3/public", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadExternalV3(req, res);
});

server.post("/api/v3/public/upload-by-cid", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadCidExternalV3(req, res);
});

server.post("/api/v3/public/upload-by-url", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadUrlExternalV3(req, res);
});

server.post("/api/v3/public/:slate", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteSlateUploadExternalV3(req, res);
});

server.post("/api/data/url", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadUrl(req, res);
});

server.post("/api/data/:upload", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUpload(req, res);
});

server.post("/api/data/zip/:upload", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUploadZip(req, res);
});

server.post("/api/deal/:upload", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUpload(req, res, { bucketName: "stage-deal" });
});

server.post("/api/download/create-zip-token", async (req, res) => {
  req.setTimeout(0);

  return await APICreateZipToken(req, res);
});

server.get("/api/download/download-by-token", async (req, res) => {
  req.setTimeout(0);

  return await APIDownloadByToken(req, res);
});

const listenServer = server.listen(Environment.PORT, (e) => {
  if (e) throw e;

  ScriptLogging.log(SHOVEL, `http://localhost:${Environment.PORT}`);
});

listenServer.headersTimeout = 0;
