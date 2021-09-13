import * as Logging from "~/common/logging";
import * as Constants from "~/node_common/constants";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ includeFiles = false, publicOnly = false } = {}) => {
  return await runQuery({
    label: "GET_EVERY_SLATE",
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

      let slates;
      if (publicOnly) {
        if (includeFiles) {
          slates = await DB.select("slates.*", slateFiles())
            .from("slates")
            .leftJoin("slate_files", "slate_files.slateId", "=", "slates.id")
            .leftJoin("files", "slate_files.fileId", "=", "files.id")
            .where("slates.isPublic", true)
            .groupBy("slates.id");
        } else {
          slates = await DB.select("*").from("slates").where("isPublic", true);
        }
      } else {
        if (includeFiles) {
          slates = await DB.select("slates.*", slateFiles())
            .from("slates")
            .leftJoin("slate_files", "slate_files.slateId", "=", "slates.id")
            .leftJoin("files", "slate_files.fileId", "=", "files.id")
            .groupBy("slates.id");
        } else {
          slates = await DB.select("*").from("slates");
        }
      }

      if (!slates || slates.error) {
        return [];
      }

      return JSON.parse(JSON.stringify(slates));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_EVERY_SLATE",
      });

      return [];
    },
  });
};
