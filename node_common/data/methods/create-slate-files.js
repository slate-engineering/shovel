import { runQuery } from "~/node_common/data/utilities";

import * as Data from "~/node_common/data";

//NOTE(martina): this is the endpoint used when adding an existing file to a slate. Creates a slate_files entry
export default async ({ owner, slate, files }) => {
  let ids = files.map((file) => file.id);

  return await runQuery({
    label: "CREATE_SLATE_FILES",
    queryFn: async (DB) => {
      //NOTE(martina): to make sure that a user owns the file before adding it to their slate
      // (relevant in cases where the file fails to upload/savecopy properly, or the owner already owns the file, then we try to add to slate)
      const toAdd = await DB.select("id")
        .from("files")
        .whereIn("id", ids)
        .where("ownerId", owner.id);
      let slateFiles = toAdd.map((file) => {
        return { slateId: slate.id, fileId: file.id };
      });

      const query = await DB.insert(slateFiles).into("slate_files").returning("*");

      if (slate.isPublic) {
        let activityItems = [];
        for (let slateFile of query) {
          if (slate.isPublic) {
            activityItems.push({
              ownerId: owner.id,
              slateId: slate.id,
              fileId: slateFile.fileId,
              type: "CREATE_SLATE_OBJECT",
            });
          } else {
            activityItems.push({
              ownerId: owner.id,
              slateId: slate.id,
              fileId: file.id,
              type: "CREATE_SLATE_OBJECT",
              ignore: true,
            });
          }
        }

        const activityQuery = await DB.insert(activityItems).into("activity");
      }

      await Data.recalcSlateFilecount({ slateId: slate.id });

      if (!query) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_SLATE_FILES",
      };
    },
  });
};
