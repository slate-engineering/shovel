import * as Environment from "~/node_common/environment";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Strings from "~/common/strings";
import * as NodeLogging from "~/node_common/node-logging";

import WebSocket from "ws";

let ws;

export const create = () => {
  if (ws) {
    return;
  }

  if (Strings.isEmpty(Environment.URI_FIJI)) {
    return;
  }

  ws = new WebSocket(Environment.URI_FIJI, {
    perMessageDeflate: false,
  });

  ws.on("ping", function () {
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
      NodeLogging.log(`Did not receive ping in time. Disconnecting websocket`);
      this.terminate();
    }, 30000 + 1000);
  });

  ws.on("open", () => {
    ws.send(JSON.stringify({ type: "SHOVEL_SUBSCRIBE_HOST", data: {} }));
  });

  ws.on("close", () => {
    global.websocket = null;
    setTimeout(() => {
      NodeLogging.log(`Auto reconnecting websocket`);
      create();
    }, 1000);
    NodeLogging.log(`Websocket disconnected`);
  });

  NodeLogging.log(`Websocket server started`);

  global.websocket = ws;
  return global.websocket;
};

export const get = () => global.websocket;
