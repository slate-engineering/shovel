import { runQuery } from "~/node_common/data/utilities";

export default async ({ id }) => {
  return await runQuery({
    label: "DELETE_USER_BY_ID",
    queryFn: async (DB) => {
      const keys = await DB.from("keys").where({ ownerId: id }).del();

      const subscriptions = await DB.from("subscriptions")
        .where({ ownerId: id })
        .orWhere({ userId: id })
        .del();

      const activity = await DB.from("activity")
        .where({ ownerId: id })
        .orWhere({ userId: id })
        .del();

      const data = await DB.from("users").where({ id }).del();

      return 1 === data;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_USER_BY_ID",
      };
    },
  });
};
