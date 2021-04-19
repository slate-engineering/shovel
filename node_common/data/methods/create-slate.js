import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, slatename, isPublic, data = {} }) => {
  return await runQuery({
    label: "CREATE_SLATE",
    queryFn: async (DB) => {
      const query = await DB.insert({
        ownerId,
        slatename,
        isPublic,
        data,
      })
        .into("slates")
        .returning("*");

      const index = query ? query.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_SLATE",
      };
    },
  });
};
