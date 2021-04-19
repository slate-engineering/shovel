import { runQuery } from "~/node_common/data/utilities";

export default async ({ userId, key, level = 1 }) => {
  return await runQuery({
    label: "CREATE_API_KEY",
    queryFn: async (DB) => {
      const query = await DB.insert({
        ownerId: userId,
        level,
        key,
      })
        .into("keys")
        .returning("*");

      const index = query ? query.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_API_KEY",
      };
    },
  });
};
