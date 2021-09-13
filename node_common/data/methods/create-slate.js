import * as Data from "~/node_common/data";

import { runQuery } from "~/node_common/data/utilities";

export default async (slate) => {
  return await runQuery({
    label: "CREATE_SLATE",
    queryFn: async (DB) => {
      const query = await DB.insert(slate).into("slates").returning("*");

      const index = query ? query.pop() : null;

      if (index) {
        if (slate.isPublic) {
          const activityQuery = await DB.insert({
            ownerId: slate.ownerId,
            slateId: index.id,
            type: "CREATE_SLATE",
          }).into("activity");

          await Data.recalcUserSlatecount({ userId: ownerId });
        } else {
          const activityQuery = await DB.insert({
            ownerId: slate.ownerId,
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
