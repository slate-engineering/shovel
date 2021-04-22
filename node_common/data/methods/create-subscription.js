import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, slateId, userId }) => {
  return await runQuery({
    label: "CREATE_SUBSCRIPTION",
    queryFn: async (DB) => {
      console.log({
        ownerId,
        slateId,
        userId,
      });
      const query = await DB.insert({
        ownerId,
        slateId,
        userId,
      })
        .into("subscriptions")
        .returning("*");

      const index = query ? query.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_SUBSCRIPTION",
      };
    },
  });
};
