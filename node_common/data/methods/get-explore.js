import * as Logging from "~/common/logging";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ earliestTimestamp, latestTimestamp }) => {
  return await runQuery({
    label: "GET_EXPLORE",
    queryFn: async (DB) => {
      const users = () => DB.raw("row_to_json(??) as ??", ["users", "owner"]);

      const slates = () => DB.raw("row_to_json(??) as ??", ["slates", "slate"]);

      const files = () => DB.raw("row_to_json(??) as ??", ["files", "file"]);

      let query;
      if (earliestTimestamp) {
        //NOTE(martina): for pagination, fetching the "next 100" results
        let date = new Date(earliestTimestamp);
        let s = date.getSeconds();
        if (s < 0) {
          s = 60 + s;
        }
        date.setSeconds(s - 1);
        query = await DB.select(
          "activity.id",
          "activity.type",
          "activity.createdAt",
          "activity.slateId",
          // users(),
          // slates(),
          files()
        )
          .from("activity")
          // .join("users", "users.id", "=", "activity.ownerId")
          .leftJoin("files", "files.id", "=", "activity.fileId")
          // .leftJoin("slates", "slates.id", "=", "activity.slateId")
          .where("activity.createdAt", "<", date.toISOString())
          .where("activity.type", "CREATE_SLATE_OBJECT")
          .orderBy("activity.createdAt", "desc")
          .limit(96);
      } else if (latestTimestamp) {
        //NOTE(martina): for fetching new updates since the last time they loaded
        let date = new Date(latestTimestamp);
        date.setSeconds(date.getSeconds() + 1);
        query = await DB.select(
          "activity.id",
          "activity.type",
          "activity.createdAt",
          "activity.slateId",
          // users(),
          // slates(),
          files()
        )
          .from("activity")
          // .join("users", "users.id", "=", "activity.ownerId")
          .leftJoin("files", "files.id", "=", "activity.fileId")
          // .leftJoin("slates", "slates.id", "=", "activity.slateId")
          .where("activity.createdAt", ">", date.toISOString())
          .where("activity.type", "CREATE_SLATE_OBJECT")
          .orderBy("activity.createdAt", "desc")
          .limit(96);
      } else {
        //NOTE(martina): for the first fetch they make, when they have not loaded any explore events yet
        query = await DB.select(
          "activity.id",
          "activity.type",
          "activity.createdAt",
          "activity.slateId",
          // users(),
          // slates(),
          files()
        )
          .from("activity")
          // .join("users", "users.id", "=", "activity.ownerId")
          .leftJoin("files", "files.id", "=", "activity.fileId")
          // .leftJoin("slates", "slates.id", "=", "activity.slateId")
          .where("activity.type", "CREATE_SLATE_OBJECT")
          .orderBy("activity.createdAt", "desc")
          .limit(96);
      }

      if (!query || query.error) {
        return [];
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_EXPLORE",
      });

      return [];
    },
  });
};
