import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

/**
 * Use sanitize = true if this data will be returned to some user other than the selected user.
 * If just using the user data on the back end, there is no need to sanitize
 * Use publicOnly = true to specify that only public files should be included when includeFiles is set to true
 */
export default async ({ id, sanitize = false, includeFiles = false, publicOnly = false }) => {
  return await runQuery({
    label: "GET_USER_BY_ID",
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
          //TODO(martina): fix this so can be done in one query. Right now, it's duplicating files for each slate_files entry. Need to do distinct on file.id for the json agg
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
          //   .where({ "users.id": id, "files.isPublic": true })
          //   .orWhere({ "users.id": id, "slates.isPublic": true })
          //   .groupBy("users.id")
          //   .first();

          query = await DB.select("*").from("users").where({ id }).first();

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
            .where({ "users.id": id })
            .leftJoin("files", "files.ownerId", "users.id")
            .groupBy("users.id")
            .first();
        }
      } else {
        query = await DB.select("*").from("users").where({ id }).first();
      }

      if (sanitize) {
        query = Serializers.sanitizeUser(query);
      }

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_USER_BY_ID",
      };
    },
  });
};
