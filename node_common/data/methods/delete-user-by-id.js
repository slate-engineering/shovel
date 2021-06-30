import { runQuery } from "~/node_common/data/utilities";

export default async ({ id }) => {
  return await runQuery({
    label: "DELETE_USER_BY_ID",
    queryFn: async (DB) => {
      const keys = await DB.from("keys").where({ ownerId: id }).del();

      const followers = await DB.from("subscriptions").where({ userId: id }).del();

      const deletedSubscriptions = await DB.from("subscriptions")
        .where({ ownerId: id })
        .whereNotNull("slateId")
        .del()
        .returning("slateId");

      const subscriberSummaryQuery = await DB.from("slates")
        .whereIn("id", deletedSubscriptions)
        .decrement("subscriberCount", 1);

      const deletedFollowing = await DB.from("subscriptions")
        .where({ ownerId: id })
        .whereNotNull("userId")
        .del()
        .returning("userId");

      const followingSummaryQuery = await DB.from("users")
        .whereIn("id", deletedFollowing)
        .decrement("followerCount", 1);

      const activity = await DB.from("activity")
        .where({ ownerId: id })
        .orWhere({ userId: id })
        .del();

      const usage = await DB.from("usage").where("userId", id).del();

      const likes = await DB.from("likes").where({ userId: id }).del().returning("fileId");

      if (likes) {
        // const fileIds = likes.map((like) => like.fileId);
        const summaryQuery = await DB.from("files").whereIn("id", likes).decrement("likeCount", 1);
      }

      const data = await DB.from("users").where({ id }).del();

      return 1 === data;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_USER_BY_ID",
      };
    },
  });
};
