import { runQuery } from "~/node_common/data/utilities";

export default async ({ slateId, ids }) => {
  return await runQuery({
    label: "DELETE_SLATE_FILES",
    queryFn: async (DB) => {
      const slateFiles = await DB("slate_files")
        .where("slateId", slateId)
        .whereIn("fileId", ids)
        .del();

      const activity = await DB("activity").whereIn("fileId", ids).where("slateId", slateId).del();

      return true;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_SLATE_FILES",
      };
    },
  });
};
