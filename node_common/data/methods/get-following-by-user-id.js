import { runQuery } from "~/node_common/data/utilities";

import * as Serializers from "~/node_common/serializers";

export default async ({ ownerId }) => {
  return await runQuery({
    label: "GET_FOLLOWING_BY_USER_ID",
    queryFn: async (DB) => {
      const query = await DB.select("users.id", "users.username", "users.data")
        .from("users")
        .join("subscriptions", "subscriptions.userId", "=", "users.id")
        .where({ "subscriptions.ownerId": ownerId })
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
      console.log({
        error: true,
        decorator: "GET_FOLLOWING_BY_USER_ID",
      });

      return [];
    },
  });
};
