import * as Data from "~/node_common/data";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, slateId, userId }) => {
  return await runQuery({
    label: "CREATE_SUBSCRIPTION",
    queryFn: async (DB) => {
      const query = await DB.insert({
        ownerId,
        slateId,
        userId,
      })
        .into("subscriptions")
        .returning("*");

      if (slateId) {
        const activityQuery = await DB.insert({
          ownerId,
          slateId,
          type: "SUBSCRIBE_SLATE",
        }).into("activity");

        await Data.recalcSlateSubscribercount({ slateId });
      } else if (userId) {
        const activityQuery = await DB.insert({
          ownerId,
          userId,
          type: "SUBSCRIBE_USER",
        }).into("activity");

        await Data.recalcUserFollowercount({ userId });
      }

      const index = query ? query.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_SUBSCRIPTION",
      };
    },
  });
};
