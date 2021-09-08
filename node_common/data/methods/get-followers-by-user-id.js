import * as Constants from "~/node_common/constants";
import * as Logging from "~/common/logging";
import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ userId }) => {
  return await runQuery({
    label: "GET_FOLLOWERS_BY_USER_ID",
    queryFn: async (DB) => {
      const query = await DB.select(...Serializers.userProperties)
        .from("users")
        .join("subscriptions", "subscriptions.ownerId", "=", "users.id")
        .where({ "subscriptions.userId": userId })
        .orderBy("subscriptions.createdAt", "desc");
      if (!query || query.error) {
        return [];
      }

      let serialized = [];
      for (let user of query) {
        serialized.push(Serializers.sanitizeUser(user));
      }

      return JSON.parse(JSON.stringify(serialized));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_FOLLOWERS_BY_USER_ID",
      });

      return [];
    },
  });
};
