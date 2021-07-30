import * as Logging from "~/common/logging";

import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): this method is specifically for making *multiple* files from one owner *public*. It will filter out the already public files
export default async ({ ids, ownerId }) => {
  return await runQuery({
    label: "UPDATE_FILES_PUBLIC",
    queryFn: async (DB) => {
      let privateFiles = await DB.select("id")
        .from("files")
        .whereIn("id", ids)
        .where("isPublic", false);
      if (!privateFiles?.length) {
        return [];
      }
      let privateIds = privateFiles.map((file) => file.id);

      let activityItems = [];
      for (let id of privateIds) {
        activityItems.push({
          ownerId,
          fileId: id,
          type: "FILE_VISIBLE",
        });
      }
      let activityQuery = await DB.insert(activityItems).into("activity");

      const summaryQuery = await DB.from("users")
        .where("id", ownerId)
        .increment("fileCount", privateIds.length);

      const response = await DB.from("files")
        .whereIn("id", privateIds)
        .update({ isPublic: true })
        .returning("*");

      return JSON.parse(JSON.stringify(response));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "UPDATE_FILES_PUBLIC",
      };
    },
  });
};
