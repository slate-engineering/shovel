import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ids, sanitize = false, includeFiles = false }) => {
  return await runQuery({
    label: "GET_SLATES_BY_IDS",
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

      if (includeFiles) {
        query = await DB.select(
          "slates.id",
          "slates.slatename",
          "slates.data",
          "slates.ownerId",
          "slates.isPublic",
          slateFiles()
        )
          .from("slates")
          .leftJoin("slate_files", "slate_files.slateId", "=", "slates.id")
          .leftJoin("files", "slate_files.fileId", "=", "files.id")
          .whereIn("slates.id", ids)
          .groupBy("slates.id");
      } else {
        query = await DB.select("id", "slatename", "data", "ownerId", "isPublic")
          .from("slates")
          .whereIn("id", ids);
      }

      if (!query || query.error) {
        return [];
      }

      let serialized = [];
      if (sanitize) {
        for (let slate of query) {
          serialized.push(Serializers.sanitizeSlate(slate));
        }
        return JSON.parse(JSON.stringify(serialized));
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_SLATES_BY_IDS",
      };
    },
  });
};
