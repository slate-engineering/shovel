import { runQuery } from "~/node_common/data/utilities";

import * as Serializers from "~/node_common/serializers";

export default async ({ ownerId }) => {
  return await runQuery({
    label: "GET_SUBSCRIPTIONS_BY_USER_ID",
    queryFn: async (DB) => {
      // const slateFiles = () =>
      //   DB.raw("json_agg(?? order by ?? asc) as ??", ["files", "slate_files.createdAt", "objects"]);

      const slateFiles = () =>
        DB.raw("coalesce(json_agg(?? order by ?? asc) filter (where ?? is not null), '[]') as ??", [
          "files",
          "slate_files.createdAt",
          "files.id",
          "objects",
        ]);

      const query = await DB.select(
        "slates.id",
        "slates.slatename",
        "slates.data",
        "slates.ownerId",
        "slates.isPublic",
        slateFiles()
      )
        .from("slates")
        .join("subscriptions", "subscriptions.slateId", "=", "slates.id")
        .join("slate_files", "slate_files.slateId", "=", "slates.id")
        .join("files", "slate_files.fileId", "=", "files.id")
        .where({ "subscriptions.ownerId": ownerId })
        // .orderBy("subscriptions.createdAt", "desc");
        .groupBy("slates.id");

      if (!query || query.error) {
        return [];
      }

      let serialized = [];
      for (let slate of query) {
        serialized.push(Serializers.sanitizeSlate(slate));
      }

      return JSON.parse(JSON.stringify(serialized));
    },
    errorFn: async (e) => {
      console.log({
        error: true,
        decorator: "GET_SUBSCRIPTIONS_BY_USER_ID",
      });

      return [];
    },
  });
};
