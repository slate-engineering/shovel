import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

//NOTE(toast): should only be used for checking if an email is taken
//ALWAYS sanitize it before sending result to frontend
export default async ({ email, sanitize = false }) => {
  return await runQuery({
    label: "GET_USER_BY_EMAIL",
    queryFn: async (DB) => {
      let query;
      if (sanitize) {
        query = await DB.select(...Serializers.userPublicProperties)
          .from("users")
          .where({ email })
          .first();
      } else {
        query = await DB.select("*").from("users").where({ email }).first();
      }

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_USER_BY_EMAIL",
      };
    },
  });
};
