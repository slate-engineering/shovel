import * as Serializers from "~/node_common/serializers";
import * as Constants from "~/node_common/constants";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ username, sanitize = false, includeFiles = false, publicOnly = false }) => {
  return await runQuery({
    label: "GET_USER_BY_USERNAME",
    queryFn: async (DB) => {
      let query;

      if (sanitize) {
        query = await DB.select(...Serializers.userPublicProperties)
          .from("users")
          .where({ username })
          .first();
      } else {
        query = await DB.select("*").from("users").where({ username }).first();
      }

      const id = query?.id;

      if (!id) {
        return null;
      }

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

          let library = await DB.select("files.*")
            .from("files")
            .leftJoin("slate_files", "slate_files.fileId", "=", "files.id")
            .leftJoin("slates", "slate_files.slateId", "=", "slates.id")
            .whereRaw("?? = ? and (?? = ? or ?? = ?)", [
              "files.ownerId",
              id,
              "files.isPublic",
              true,
              "slates.isPublic",
              true,
            ])
            // .where({ "files.ownerId": id, "slates.isPublic": true })
            // .orWhere({ "files.ownerId": id, "files.isPublic": true })
            .orderBy("files.createdAt", "desc")
            .groupBy("files.id");

          query.library = library;
        } else {
          let library = await DB.select("*")
            .from("files")
            .where({ ownerId: id })
            .orderBy("createdAt", "desc")
            .groupBy("id");

          query.library = library;

          // query = await DB.select("users.*", userFiles())
          // .from("users")
          // .where({ "users.id": id })
          // .leftJoin("files", "files.ownerId", "users.id")
          // .groupBy("users.id")
          // .first();
        }
      }

      if (!query || query.error) {
        return null;
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
