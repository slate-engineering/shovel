import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): can be single activity item (an object) or multiple activity items (an array of objects)
export default async (activityItems) => {
  return await runQuery({
    label: "CREATE_ACTIVITY",
    queryFn: async (DB) => {
      //TODO(martina): optimization. check for whether something with the same file exists already, so we don't repeat frequently
      let query = await DB.insert(activityItems).into("activity").returning("*");

      if (!query) {
        return null;
      }
      if (!Array.isArray(activityItems)) {
        query = query.pop();
      }
      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_ACTIVITY",
      };
    },
  });
};
