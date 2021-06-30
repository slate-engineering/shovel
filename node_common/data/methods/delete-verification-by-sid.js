import { runQuery } from "~/node_common/data/utilities";

export default async ({ sid }) => {
  return await runQuery({
    label: "DELETE_VERIFICATION_BY_SID",
    queryFn: async (DB) => {
      const query = await DB.from("verifications").where({ sid }).del();

      return 1 === query;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_VERIFICATION_BY_SID",
      };
    },
  });
};
