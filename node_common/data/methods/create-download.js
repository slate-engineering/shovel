import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): remember to include an ownerId for the file
export default async ({ userId, files }) => {
  return await runQuery({
    label: "CREATE_DOWNLOAD",
    queryFn: async (DB) => {
      let activityItems = [];
      for (let file of files) {
        activityItems.push({
          ownerId: userId,
          fileId: file.id,
          type: "DOWNLOAD_FILE",
        });
      }
      let activityQuery = await DB.insert(activityItems).into("activity");

      const ids = files.map((file) => file.id);
      let summaryQuery = await DB.from("files").whereIn("id", ids).increment("downloadCount", 1);

      return true;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_DOWNLOAD",
      };
    },
  });
};
