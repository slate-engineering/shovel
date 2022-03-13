import * as Arrays from "~/common/arrays";
import * as Data from "~/node_common/data";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ids, ownerId }) => {
  return await runQuery({
    label: "DELETE_FILES_BY_IDS",
    queryFn: async (DB) => {
      const repostedSlateFiles = await DB.from("slate_files")
        .whereIn("id", function () {
          this.select("slate_files.id")
            .from("slate_files")
            .join("slates", "slates.id", "=", "slate_files.slateId")
            .whereIn("slate_files.fileId", ids)
            .whereNot("slates.ownerId", "=", ownerId);
        })
        .del();

      const slateFiles = await DB("slate_files").whereIn("fileId", ids).del().returning("slateId");

      for (let slateId of slateFiles) {
        await Data.recalcSlateFilecount({ slateId });
      }

      const activity = await DB("activity").whereIn("fileId", ids).del();

      const files = await DB("files").whereIn("id", ids).del().returning("*");

      return files;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_FILES_BY_IDS",
      };
    },
  });
};
