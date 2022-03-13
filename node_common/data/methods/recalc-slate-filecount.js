import { runQuery } from "~/node_common/data/utilities";

export default async ({ slateId }) => {
  return await runQuery({
    label: "RECALC_SLATE_FILECOUNT",
    queryFn: async (DB) => {
      const fileCountFields = ["id", "slate_files", "slateId", slateId];
      const fileCount = `(SELECT COUNT(??) FROM ?? WHERE ?? = ?)`;

      const updateFields = ["slates", "fileCount", ...fileCountFields, "id", slateId];
      const update = await DB.raw(
        `UPDATE ?? SET ?? = ${fileCount} WHERE ?? = ? RETURNING *`,
        updateFields
      );

      return true;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "RECALC_SLATE_FILECOUNT",
      };
    },
  });
};
