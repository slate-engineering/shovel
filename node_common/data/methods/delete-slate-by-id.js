import * as Data from "~/node_common/data";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ id }) => {
  return await runQuery({
    label: "DELETE_SLATE_BY_ID",
    queryFn: async (DB) => {
      const subscriptions = await DB("subscriptions").where({ slateId: id }).del();

      const slateFiles = await DB("slate_files").where({ slateId: id }).del();

      const activity = await DB("activity").where({ slateId: id }).del();

      const data = await DB("slates").where({ id }).del().returning("*");

      let slate = data ? data.pop() : data;
      if (slate?.isPublic) {
        await Data.recalcUserSlatecount({ userId: slate.ownerId });
      }

      return slate;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "DELETE_SLATE_BY_ID",
      };
    },
  });
};
