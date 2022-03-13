import { runQuery } from "~/node_common/data/utilities";

export default async ({ slateId }) => {
  return await runQuery({
    label: "RECALC_SLATE_SUBSCRIBERCOUNT",
    queryFn: async (DB) => {
      const subscriberCountFields = ["id", "subscriptions", "slateId", slateId];
      const subscriberCount = `(SELECT COUNT(??) FROM ?? WHERE ?? = ?)`;

      const updateFields = ["slates", "subscriberCount", ...subscriberCountFields, "id", slateId];
      const update = await DB.raw(
        `UPDATE ?? SET ?? = ${subscriberCount} WHERE ?? = ? RETURNING *`,
        updateFields
      );

      return true;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "RECALC_SLATE_SUBSCRIBERCOUNT",
      };
    },
  });
};
