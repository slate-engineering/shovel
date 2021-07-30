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

      if (index) {
        if (isPublic) {
          const activityQuery = await DB.insert({
            ownerId,
            slateId: index.id,
            type: "CREATE_SLATE",
          }).into("activity");

          const summaryQuery = await DB.from("users")
            .where("id", ownerId)
            .increment("slateCount", 1);
        } else {
          const activityQuery = await DB.insert({
            ownerId,
            slateId: index.id,
            type: "CREATE_SLATE",
            ignore: true,
          }).into("activity");
        }
      }

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
