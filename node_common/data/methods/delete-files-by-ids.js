import { runQuery } from "~/node_common/data/utilities";

export default async ({ ids, ownerId }) => {
  return await runQuery({
    label: "DELETE_FILES_BY_IDS",
    queryFn: async (DB) => {
      // const repostedSlateFiles = await DB.from("slate_files")
      //   .join("slates", "slates.id", "=", "slate_files.slateId")
      //   .whereNot("slates.ownerId", "=", ownerId)
      //   .whereIn("slate_files.fileId", ids)
      //   .update({ "slate_files.fileId": null });
      const repostedSlateFiles = await DB.from("slate_files")
        .whereIn("id", function () {
          this.select("slate_files.id")
            .from("slate_files")
            .join("slates", "slates.id", "=", "slate_files.slateId")
            .whereIn("slate_files.fileId", ids)
            .whereNot("slates.ownerId", "=", ownerId);
        })
        .del();

      const slateFiles = await DB("slate_files").whereIn("fileId", ids).del();

      const activity = await DB("activity").whereIn("fileId", ids).del();

      const files = await DB("files").whereIn("id", ids).del();

      return files === ids.length;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_FILES_BY_IDS",
      };
    },
  });
};
