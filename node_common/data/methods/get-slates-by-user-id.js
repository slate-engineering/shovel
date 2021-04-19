import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, sanitize = false, includeFiles = false, publicOnly = false }) => {
  return await runQuery({
    label: "GET_SLATES_BY_USER_ID",
    queryFn: async (DB) => {
      // const slateFiles = () =>
      //   DB.raw("json_agg(?? order by ?? asc) as ??", ["files", "slate_files.createdAt", "objects"]);

      // const slateFiles = () =>
      //   DB.raw("coalesce(json_agg(?? order by ?? asc), '[]'::json) as ??", [
      //     "files",
      //     "slate_files.createdAt",
      //     "objects",
      //   ]);
      const slateFiles = () =>
        DB.raw("coalesce(json_agg(?? order by ?? asc) filter (where ?? is not null), '[]') as ??", [
          "files",
          "slate_files.createdAt",
          "files.id",
          "objects",
        ]);

      let query;

      if (includeFiles) {
        if (publicOnly) {
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
            .where({ "slates.ownerId": ownerId, "slates.isPublic": true })
            .groupBy("slates.id")
            .orderBy("slates.updatedAt", "desc");
        } else {
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
            .where({ "slates.ownerId": ownerId })
            .groupBy("slates.id")
            .orderBy("slates.updatedAt", "desc");
        }
      } else {
        if (publicOnly) {
          query = await DB.select("id", "slatename", "data", "ownerId", "isPublic")
            .from("slates")
            .where({ "slates.ownerId": ownerId, "slates.isPublic": true })
            .orderBy("updatedAt", "desc");
        } else {
          query = await DB.select("id", "slatename", "data", "ownerId", "isPublic")
            .from("slates")
            .where({ "slates.ownerId": ownerId })
            .orderBy("updatedAt", "desc");
        }
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
      console.log({
        error: true,
        decorator: "GET_SLATES_BY_USER_ID",
      });

      return [];
    },
  });
};
