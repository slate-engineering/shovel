import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId }) => {
  return await runQuery({
    label: "DELETE_FILES_BY_USER_ID",
    queryFn: async (DB) => {
      const selected = await DB.select("id").from("files").where({ ownerId });

      if (!selected || selected.error) {
        return false;
      }

      let fileIds = selected.map((file) => file.id);

      //TODO(martina): send out a notification for this instead
      const repostedSlateFiles = await DB.from("slate_files")
        .whereIn("id", function () {
          this.select("slate_files.id")
            .from("slate_files")
            .join("slates", "slates.id", "=", "slate_files.slateId")
            .whereIn("slate_files.fileId", fileIds)
            .whereNot("slates.ownerId", "=", ownerId);
        })
        .del();
      // .update({ fileId: null });

      const slateFiles = await DB("slate_files").whereIn("fileId", fileIds).del();

      const activity = await DB("activity").whereIn("fileId", fileIds).del();

      const files = await DB("files").whereIn("id", fileIds).del().returning("*");

      return files;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_FILES_BY_USER_ID",
      };
    },
  });
};
