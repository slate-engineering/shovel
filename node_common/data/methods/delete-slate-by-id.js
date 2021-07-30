import { runQuery } from "~/node_common/data/utilities";

export default async ({ id }) => {
  return await runQuery({
    label: "DELETE_SLATE_BY_ID",
    queryFn: async (DB) => {
      const subscriptions = await DB("subscriptions").where({ slateId: id }).del();

      const slateFiles = await DB("slate_files").where({ slateId: id }).del();

      const activity = await DB("activity").where({ slateId: id }).del();

      const slates = await DB("slates").where({ id }).del().returning("*");

      if (slates) {
        const slate = slates.pop();
        if (slate.isPublic) {
          const summaryQuery = await DB.from("users")
            .where("id", slate.ownerId)
            .decrement("slateCount", 1);
        }
      }

      return slates;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_SLATE_BY_ID",
      };
    },
  });
};
