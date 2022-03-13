import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

//NOTE(toast): should only be used for checking if an email is taken
//ALWAYS sanitize it before sending result to frontend
export default async ({ twitterId }) => {
  return await runQuery({
    label: "GET_USER_BY_TWITTER_ID",
    queryFn: async (DB) => {
      let query = await DB.select(...Serializers.userPublicProperties)
        .from("users")
        .where({ twitterId })
        .first();

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_USER_BY_TWITTER_ID",
      };
    },
  });
};
