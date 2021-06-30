import { runQuery } from "~/node_common/data/utilities";

export default async ({ sid }) => {
  return await runQuery({
    label: "GET_VERIFICATION_BY_SID",
    queryFn: async (DB) => {
      const query = await DB.select("*").from("verifications").where({ sid }).first();
      if (!query || query.error) {
        return null;
      }

      if (query.id) {
        return JSON.parse(JSON.stringify(query));
      }

      return query;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_VERIFICATION_BY_SID",
      };
    },
  });
};
