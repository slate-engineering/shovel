import * as Logging from "~/common/logging";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ownerId, includeFiles = false, publicOnly = false }) => {
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
          query = await DB.select("slates.*", slateFiles())
            .from("slates")
            .leftJoin("slate_files", "slate_files.slateId", "=", "slates.id")
            .leftJoin("files", "slate_files.fileId", "=", "files.id")
            .where({ "slates.ownerId": ownerId, "slates.isPublic": true })
            .groupBy("slates.id")
            .orderBy("slates.updatedAt", "desc");
        } else {
          query = await DB.select("slates.*", slateFiles())
            .from("slates")
            .leftJoin("slate_files", "slate_files.slateId", "=", "slates.id")
            .leftJoin("files", "slate_files.fileId", "=", "files.id")
            .where({ "slates.ownerId": ownerId })
            .groupBy("slates.id")
            .orderBy("slates.updatedAt", "desc");
        }
      } else {
        if (publicOnly) {
          query = await DB.select("*")
            .from("slates")
            .where({ ownerId: ownerId, isPublic: true })
            .orderBy("updatedAt", "desc");
        } else {
          query = await DB.select("*")
            .from("slates")
            .where({ ownerId: ownerId })
            .orderBy("updatedAt", "desc");
        }
      }

      if (!query || query.error) {
        return [];
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_SLATES_BY_USER_ID",
      });

      return [];
    },
  });
};
