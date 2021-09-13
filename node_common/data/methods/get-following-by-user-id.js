import * as Constants from "~/node_common/constants";
import * as Logging from "~/common/logging";
import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId }) => {
  return await runQuery({
    label: "GET_FOLLOWING_BY_USER_ID",
    queryFn: async (DB) => {
      const query = await DB.select(...Serializers.userPublicProperties)
        .from("users")
        .join("subscriptions", "subscriptions.userId", "=", "users.id")
        .where({ "subscriptions.ownerId": ownerId })
        .orderBy("subscriptions.createdAt", "desc");

      if (!query || query.error) {
        return [];
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_FOLLOWING_BY_USER_ID",
      });

      return [];
    },
  });
};
