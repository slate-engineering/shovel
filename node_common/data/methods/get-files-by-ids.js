import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ids, publicOnly = false }) => {
  return await runQuery({
    label: "GET_FILES_BY_IDS",
    queryFn: async (DB) => {
      let query;
      if (publicOnly) {
        query = await DB.select("*").from("files").whereIn("id", ids).where("isPublic", true);
      } else {
        query = await DB.select("*").from("files").whereIn("id", ids);
      }

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_FILES_BY_IDS",
      };
    },
  });
};
