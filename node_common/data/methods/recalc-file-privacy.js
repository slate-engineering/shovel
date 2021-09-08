import { runQuery } from "~/node_common/data/utilities";

export default async ({ fileId }) => {
  return await runQuery({
    label: "RECALC_FILE_PRIVACY",
    queryFn: async (DB) => {
      const slateIds = `(SELECT ?? FROM ?? WHERE ?? = ?)`;
      const slateIdsFields = ["slateId", "slate_files", "fileId", fileId];

      const filePrivacy = `(SELECT EXISTS (SELECT * FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ?))`;
      const filePrivacyFields = [
        "slates",
        "slate_ids",
        "slates.id",
        "slate_ids.slateId",
        "isPublic",
        true,
      ];

      const update = `UPDATE ?? SET ?? = ${filePrivacy} WHERE ?? = ?`;
      const updateFields = ["files", "isPublic", ...filePrivacyFields, "id", fileId];

      const updatedFile = await DB.raw(`WITH ?? AS ${slateIds} ${update} RETURNING *`, [
        "slate_ids",
        ...slateIdsFields,
        ...updateFields,
      ]);
      let rows = updatedFile.rows;
      if (rows?.length) {
        return rows.pop();
      }

      return true;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "RECALC_FILE_PRIVACY",
      };
    },
  });
};
