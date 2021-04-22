import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ sanitize = false, publicOnly = false } = {}) => {
  return await runQuery({
    label: "GET_EVERY_FILE",
    queryFn: async (DB) => {
      let files;
      if (publicOnly) {
        files = await DB.select(
          "files.id",
          "files.ownerId",
          "files.cid",
          "files.isPublic",
          "files.data"
        )
          .from("files")
          .leftJoin("slate_files", "slate_files.fileId", "files.id")
          .leftJoin("slates", "slate_files.slateId", "slates.id")
          .where("slates.isPublic", true)
          .orWhere("files.isPublic", true)
          .groupBy("files.id");
      } else {
        files = await DB.select("*").from("files");
      }

      if (!files || files.error) {
        return [];
      }

      if (sanitize) {
        files = files.map((file) => Serializers.sanitizeFile(file));
      }

      return JSON.parse(JSON.stringify(files));
    },
    errorFn: async (e) => {
      console.log({
        error: true,
        decorator: "GET_EVERY_FILE",
      });

      return [];
    },
  });
};
