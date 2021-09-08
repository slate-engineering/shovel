import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, cids }) => {
  return await runQuery({
    label: "GET_FILES_BY_CIDS",
    queryFn: async (DB) => {
      let query;
      if (ownerId) {
        query = await DB.select("*").from("files").where("ownerId", ownerId).whereIn("cid", cids);
      } else {
        query = await DB.select("*").from("files").whereIn("cid", cids);
      }

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_FILES_BY_CIDS",
      };
    },
  });
};
