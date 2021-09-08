import { runQuery } from "~/node_common/data/utilities";

export default async ({ userId }) => {
  return await runQuery({
    label: "RECALC_USER_FOLLOWERCOUNT",
    queryFn: async (DB) => {
      const followerCountFields = ["id", "subscriptions", "userId", userId];
      const followerCount = `(SELECT COUNT(??) FROM ?? WHERE ?? = ?)`;

      const updateFields = ["users", "followerCount", ...followerCountFields, "id", userId];
      const update = await DB.raw(
        `UPDATE ?? SET ?? = ${followerCount} WHERE ?? = ? RETURNING *`,
        updateFields
      );

      return true;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "RECALC_USER_FOLLOWERCOUNT",
      };
    },
  });
};
