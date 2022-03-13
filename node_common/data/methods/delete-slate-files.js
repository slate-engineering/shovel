import * as Data from "~/node_common/data";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ slateId, ids }) => {
  return await runQuery({
    label: "DELETE_SLATE_FILES",
    queryFn: async (DB) => {
      const slateFiles = await DB("slate_files")
        .where("slateId", slateId)
        .whereIn("fileId", ids)
        .del()
        .returning("*");

      const activityQuery = await DB("activity")
        .where({ slateId, type: "CREATE_SLATE_OBJECT" })
        .whereIn("fileId", ids)
        .del();

      await Data.recalcSlateFilecount({ slateId });

      return slateFiles;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_SLATE_FILES",
      };
    },
  });
};
