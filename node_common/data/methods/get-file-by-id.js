import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ id }) => {
  return await runQuery({
    label: "GET_FILE_BY_ID",
    queryFn: async (DB) => {
      const query = await DB.select("*").from("files").where({ id }).first();

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_FILE_BY_ID",
      };
    },
  });
};
