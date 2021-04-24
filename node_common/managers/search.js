import * as Environment from "~/node_common/environment";
import * as Utilities from "~/node_common/utilities";
import * as Serializers from "~/node_common/serializers";
import * as Strings from "~/common/strings";
import * as Websocket from "~/node_common/nodejs-websocket";
import * as NodeLogging from "~/node_common/node-logging";
import * as Window from "~/common/window";

import WebSocket from "ws";

const websocketSend = async (type, data) => {
  if (Strings.isEmpty(Environment.PUBSUB_SECRET)) {
    return;
  }

  let ws = Websocket.get();
  if (!ws) {
    ws = Websocket.create();
    await Window.delay(2000);
  }

  const encryptedData = await Utilities.encryptWithSecret(
    JSON.stringify(data),
    Environment.PUBSUB_SECRET
  );

  // NOTE(jim): Only allow this to be passed around encrypted.
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type,
        iv: encryptedData.iv,
        data: encryptedData.hex,
      })
    );
  }
};

export const updateFile = async (file, action) => {
  if (!file || !action) return;

  NodeLogging.log(`Search is updating file ...`);

  let data;
  if (Array.isArray(file)) {
    data = file.map((item) => {
      return { ...Serializers.sanitizeFile(item), type: "FILE" };
    });
  } else {
    data = { ...Serializers.sanitizeFile(file), type: "FILE" };
  }

  websocketSend("UPDATE", {
    id: "LENS",
    data: { action, data },
  });
};
