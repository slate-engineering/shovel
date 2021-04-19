import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ ids, sanitize = false, publicOnly = false }) => {
  return await runQuery({
    label: "GET_FILES_BY_IDS",
    queryFn: async (DB) => {
      let query;
      if (publicOnly) {
        query = await DB.select(
          "files.id",
          "files.ownerId",
          "files.cid",
          "files.isPublic",
          "files.filename",
          "files.data"
        )
          .from("files")
          .leftJoin("slate_files", "slate_files.fileId", "=", "files.id")
          .leftJoin("slates", "slates.id", "=", "slate_files.slateId")
          .whereIn("files.id", ids)
          .where("files.isPublic", true)
          .orWhereIn("files.id", ids)
          .andWhere("slates.isPublic", true)
          .groupBy("files.id");
      } else {
        query = await DB.select("*").from("files").whereIn("id", ids);
      }

      if (!query || query.error) {
        return null;
      }

      if (sanitize) {
        query = query.map((file) => Serializers.sanitizeFile(file));
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_FILES_BY_IDS",
      };
    },
  });
};
