import * as Logging from "~/common/logging";
import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ publicOnly = false } = {}) => {
  return await runQuery({
    label: "GET_EVERY_FILE",
    queryFn: async (DB) => {
      let files;
      if (publicOnly) {
        files = await DB.select("*").from("files").where("isPublic", true);
      } else {
        files = await DB.select("*").from("files");
      }

      if (!files || files.error) {
        return [];
      }

      return JSON.parse(JSON.stringify(files));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_EVERY_FILE",
      });

      return [];
    },
  });
};
