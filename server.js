import * as Environment from "~/node_common/environment";
import * as ScriptLogging from "~/node_common/script-logging";

import APIRouteIndex from "~/pages";
import APIRouteUpload from "~/pages/upload";

import express from "express";
import cors from "cors";
import compression from "compression";

const server = express();

const SHOVEL = "SERVER START    ";

server.use(cors());
server.get("/favicon.ico", (req, res) => res.status(204));

server.get("/", async (req, res) => {
  return await APIRouteIndex(req, res);
});

server.post("/api/data/:upload", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUpload(req, res);
});

server.post("/api/deal/:upload", async (req, res) => {
  req.setTimeout(0);

  return await APIRouteUpload(req, res, { bucketName: "stage-deal" });
});

const listenServer = server.listen(Environment.PORT, (e) => {
  if (e) throw e;

  ScriptLogging.log(SHOVEL, `http://localhost:${Environment.PORT}`);
});

listenServer.headersTimeout = 0;
