import { runQuery } from "~/node_common/data/utilities";

export default async ({ email }) => {
  return await runQuery({
    label: "DELETE_VERIFICATION_BY_EMAIL",
    queryFn: async (DB) => {
      const query = await DB.from("verifications").where({ email }).del();

      return 1 === query;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_VERIFICATION_BY_EMAIL",
      };
    },
  });
};
