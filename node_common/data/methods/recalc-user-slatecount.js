import { runQuery } from "~/node_common/data/utilities";

export default async ({ userId }) => {
  return await runQuery({
    label: "RECALC_USER_SLATECOUNT",
    queryFn: async (DB) => {
      const slateCountFields = ["id", "slates", "ownerId", userId, "isPublic", true];
      const slateCount = `(SELECT COUNT(??) FROM ?? WHERE ?? = ? AND ?? = ?)`;

      const updateFields = ["users", "slateCount", ...slateCountFields, "id", userId];
      const update = await DB.raw(
        `UPDATE ?? SET ?? = ${slateCount} WHERE ?? = ? RETURNING *`,
        updateFields
      );

      return true;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "RECALC_USER_SLATECOUNT",
      };
    },
  });
};
