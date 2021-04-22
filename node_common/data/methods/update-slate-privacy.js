import { runQuery } from "~/node_common/data/utilities";

export default async ({ id, isPublic }) => {
  return await runQuery({
    label: "UPDATE_SLATE_PRIVACY",
    queryFn: async (DB) => {
      if (!isPublic) {
        const subscriptions = await DB("subscriptions").where({ slateId: id }).del();

        const activity = await DB("activity").where("slateId", id).del();
      }

      const response = await DB.from("slates").where("id", id).update({ isPublic }).returning("*");

      const index = response ? response.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "UPDATE_SLATE_PRIVACY",
      };
    },
  });
};
