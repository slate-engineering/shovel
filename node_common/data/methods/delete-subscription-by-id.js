import { runQuery } from "~/node_common/data/utilities";

export default async ({ id, ownerId, userId, slateId }) => {
  return await runQuery({
    label: "DELETE_SUBSCRIPTION_BY_ID",
    queryFn: async (DB) => {
      const data = await DB.from("subscriptions").where({ id }).del();

      if (userId) {
        const activityQuery = await DB("activity")
          .where({ type: "SUBSCRIBE_USER", ownerId, userId })
          .del();

        let summaryQuery = await DB.from("users")
          .where({ id: userId })
          .decrement("followerCount", 1);
      } else if (slateId) {
        const activityQuery = await DB("activity")
          .where({ type: "SUBSCRIBE_SLATE", ownerId, slateId })
          .del();

        let summaryQuery = await DB.from("slates")
          .where({ id: slateId })
          .decrement("subscriberCount", 1);
      }

      return 1 === data;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_SUBSCRIPTION_BY_ID",
      };
    },
  });
};
