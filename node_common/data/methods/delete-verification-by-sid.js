import { runQuery } from "~/node_common/data/utilities";

export default async ({ sid }) => {
  return await runQuery({
    label: "DELETE_VERIFICATION_BY_SID",
    queryFn: async (DB) => {
      const data = await DB.from("verifications").where({ sid }).del().returning("*");

      return data;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_VERIFICATION_BY_SID",
      };
    },
  });
};
