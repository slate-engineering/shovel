import * as Data from "~/node_common/data";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ id, ownerId, userId, slateId }) => {
  return await runQuery({
    label: "DELETE_SUBSCRIPTION_BY_ID",
    queryFn: async (DB) => {
      const data = await DB.from("subscriptions").where({ id }).del().returning("*");

      let subscription = data ? data.pop() : data;

      if (subscription?.userId) {
        const activityQuery = await DB("activity")
          .where({
            type: "SUBSCRIBE_USER",
            ownerId: subscription.ownerId,
            userId: subscription.userId,
          })
          .del();

        await Data.recalcUserFollowercount({ userId });
      } else if (subscription?.slateId) {
        const activityQuery = await DB("activity")
          .where({
            type: "SUBSCRIBE_SLATE",
            ownerId: subscription.slateId,
            userId: subscription.slateId,
          })
          .del();

        await Data.recalcSlateSubscribercount({ slateId });
      }

      return subscription;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_SUBSCRIPTION_BY_ID",
      };
    },
  });
};
