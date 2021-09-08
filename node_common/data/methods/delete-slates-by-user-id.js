import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId }) => {
  return await runQuery({
    label: "DELETE_SLATES_BY_USER_ID",
    queryFn: async (DB) => {
      const selected = await DB.select("id").from("slates").where({ ownerId });

      if (!selected || selected.error) {
        return false;
      }

      let slateIds = selected.map((slate) => slate.id);

      const subscriptions = await DB("subscriptions").whereIn("slateId", slateIds).del();

      const slateFiles = await DB("slate_files").whereIn("slateId", slateIds).del();

      const activity = await DB("activity").whereIn("slateId", slateIds).del();

      const slates = await DB("slates").whereIn("id", slateIds).del().returning("*");

      return slates;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_SLATES_BY_USER_ID",
      };
    },
  });
};
