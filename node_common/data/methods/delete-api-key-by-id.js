import { runQuery } from "~/node_common/data/utilities";

export default async ({ id }) => {
  return await runQuery({
    label: "DELETE_API_KEY_BY_ID",
    queryFn: async (DB) => {
      const data = await DB.from("keys").where({ id }).del().returning("*");

      let key = data ? data.pop() : data;

      return key;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_API_KEY_BY_ID",
      };
    },
  });
};
