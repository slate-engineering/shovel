import * as Data from "~/node_common/data";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, id, isPublic }) => {
  return await runQuery({
    label: "UPDATE_SLATE_PRIVACY",
    queryFn: async (DB) => {
      // if (!isPublic) {
      //   const subscriptions = await DB("subscriptions").where({ slateId: id }).del();
      // }

      const response = await DB.from("slates").where("id", id).update({ isPublic }).returning("*");

      await Data.recalcUserSlatecount({ userId: ownerId });

      if (isPublic) {
        let activityQuery = await DB.insert({
          type: "SLATE_VISIBLE",
          ownerId,
          slateId: id,
        }).into("activity");
      } else {
        let activityQuery = await DB("activity")
          .where({
            slateId: id,
          })
          .update({ ignore: true });
      }

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
