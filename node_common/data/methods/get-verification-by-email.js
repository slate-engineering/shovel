import { runQuery } from "~/node_common/data/utilities";

export default async ({ email }) => {
  return await runQuery({
    label: "GET_VERIFICATION_BY_EMAIL",
    queryFn: async (DB) => {
      const query = await DB.select("*").from("verifications").where({ email }).first();

      if (!query || query.error) {
        return null;
      }

      if (query.id) {
        return JSON.parse(JSON.stringify(query));
      }

      return null;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_VERIFICATION_BY_EMAIL",
      };
    },
  });
};
