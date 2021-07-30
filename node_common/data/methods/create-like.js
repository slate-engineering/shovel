import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): remember to include an ownerId for the file
export default async ({ userId, fileId }) => {
  return await runQuery({
    label: "CREATE_LIKE",
    queryFn: async (DB) => {
      let query = await DB.insert({ userId, fileId }).into("likes").returning("*");

      let summaryQuery = await DB.from("files").where({ id: fileId }).increment("likeCount", 1);

      let activityQuery = await DB.insert({
        type: "LIKE_FILE",
        ownerId: userId,
        fileId,
      }).into("activity");

      if (!query) {
        return null;
      }

      query = query.pop();
      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_LIKE",
      };
    },
  });
};
