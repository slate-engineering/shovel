import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ id, sanitize = false, publicOnly = false }) => {
  return await runQuery({
    label: "GET_FILES_BY_USER_ID",
    queryFn: async (DB) => {
      let query;
      if (publicOnly) {
        query = await DB.select("*")
          .from("files")
          .where({ ownerId: id, isPublic: true })
          .orderBy("createdAt", "desc");
      } else {
        query = await DB.select("*")
          .from("files")
          .where("ownerId", id)
          .orderBy("createdAt", "desc");
      }

      if (!query || query.error) {
        return null;
      }

      let serialized = [];
      if (sanitize) {
        for (let file of query) {
          serialized.push(Serializers.sanitizeFile(file));
        }
        return JSON.parse(JSON.stringify(serialized));
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_FILES_BY_USER_ID",
      };
    },
  });
};
