import * as Logging from "~/common/logging";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ userId }) => {
  return await runQuery({
    label: "GET_API_KEYS_BY_USER_ID",
    queryFn: async (DB) => {
      const query = await DB.select("*").from("keys").where({ ownerId: userId });

      if (!query || query.error) {
        return [];
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_API_KEYS_BY_USER_ID",
      });

      return [];
    },
  });
};
