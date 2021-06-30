import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): remember to include an ownerId for the file
export default async ({ fileId, userId }) => {
  return await runQuery({
    label: "DELETE_LIKE_BY_FILE",
    queryFn: async (DB) => {
      let query = await DB("likes").where({ userId, fileId }).del().returning("*");

      let summaryQuery = await DB.from("files").where({ id: fileId }).decrement("likeCount", 1);

      let activityQuery = await DB("activity")
        .where({ ownerId: userId, fileId, type: "LIKE_FILE" })
        .del();

      if (!query) {
        return null;
      }

      query = query.pop();
      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_LIKE_BY_FILE",
      };
    },
  });
};
