import { runQuery } from "~/node_common/data/utilities";

export default async ({ email }) => {
  return await runQuery({
    label: "DELETE_VERIFICATION_BY_EMAIL",
    queryFn: async (DB) => {
      const data = await DB.from("verifications").where({ email }).del().returning("*");

      return data;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_VERIFICATION_BY_EMAIL",
      };
    },
  });
};
