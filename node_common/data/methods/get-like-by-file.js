import { runQuery } from "~/node_common/data/utilities";

export default async ({ userId, fileId }) => {
  return await runQuery({
    label: "GET_LIKE_BY_FILE",
    queryFn: async (DB) => {
      const query = await DB.select("*").from("likes").where({ userId, fileId }).first();

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
        decorator: "GET_LIKE_BY_FILE",
      };
    },
  });
};
