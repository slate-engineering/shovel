import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ username, sanitize = false, includeFiles = false, publicOnly = false }) => {
  return await runQuery({
    label: "GET_USER_BY_USERNAME",
    queryFn: async (DB) => {
      // const userFiles = () =>
      //   DB.raw("json_agg(?? order by ?? desc) as ??", ["files", "files.createdAt", "library"]);

      const userFiles = () =>
        DB.raw(
          "coalesce(json_agg(?? order by ?? desc) filter (where ?? is not null), '[]') as ??",
          ["files", "files.createdAt", "files.id", "library"]
        );

      let query;
      if (includeFiles) {
        if (publicOnly) {
          // query = await DB.select(
          //   "users.id",
          //   "users.username",
          //   "users.data",
          //   "users.email",
          //   userFiles()
          // )
          //   .from("users")
          //   .join("files", "files.ownerId", "users.id")
          //   .join("slate_files", "files.id", "=", "slate_files.fileId")
          //   .join("slates", "slates.id", "=", "slate_files.slateId")
          //   .where({ "users.username": username, "files.isPublic": true })
          //   .orWhere({ "users.username": username, "slates.isPublic": true })
          //   .groupBy("users.id");
          // .first();

          // let subquery = () =>
          //   DB.select(
          //     "files.id",
          //     "files.ownerId",
          //     "files.cid",
          //     "files.isPublic",
          //     "files.filename",
          //     "files.data"
          //   )
          //     .from("files")
          //     .join("slate_files", "files.id", "=", "slate_files.fileId")
          //     .join("slates", "slates.id", "=", "slate_files.slateId")
          //     .where({ "files.isPublic": true })
          //     .orWhere({ "slates.isPublic": true })
          //     .as("files");

          // query = await DB.select(
          //   "users.id",
          //   "users.username",
          //   "users.data",
          //   "users.email",
          //   userFiles()
          // )
          //   .from("users")
          //   .join(subquery(), "publicFiles.ownerId", "=", "users.id")
          //   .where({ "users.username": username })
          //   .groupBy("users.id")
          //   .first();
          query = await DB.select("*").from("users").where({ username }).first();

          const id = query.id;

          let library = await DB.select(
            "files.id",
            "files.ownerId",
            "files.cid",
            "files.isPublic",
            "files.filename",
            "files.data"
          )
            .from("files")
            .leftJoin("slate_files", "slate_files.fileId", "=", "files.id")
            .leftJoin("slates", "slate_files.slateId", "=", "slates.id")
            .where({ "files.ownerId": id, "slates.isPublic": true })
            .orWhere({ "files.ownerId": id, "files.isPublic": true })
            .orderBy("files.createdAt", "desc")
            .groupBy("files.id");

          query.library = library;
        } else {
          query = await DB.select(
            "users.id",
            "users.username",
            "users.data",
            "users.email",
            userFiles()
          )
            .from("users")
            .where({ "users.username": username })
            .leftJoin("files", "files.ownerId", "users.id")
            .first();
        }
      } else {
        query = await DB.select("*").from("users").where({ username }).first();
      }

      if (!query || query.error) {
        return null;
      }

      if (sanitize) {
        query = Serializers.sanitizeUser(query);
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_USER_BY_USERNAME",
      };
    },
  });
};
