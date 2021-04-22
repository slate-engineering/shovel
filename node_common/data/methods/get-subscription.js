import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, slateId, userId }) => {
  let whereQuery;

  if (slateId) {
    whereQuery = { ownerId, slateId };
  } else if (userId) {
    whereQuery = { ownerId, userId };
  }

  return await runQuery({
    label: "GET_SUBSCRIPTION",
    queryFn: async (DB) => {
      const query = await DB.select("*").from("subscriptions").where(whereQuery).first();

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
        decorator: "GET_SUBSCRIPTION",
      };
    },
  });
};
