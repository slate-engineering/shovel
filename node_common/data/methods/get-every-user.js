import * as Logging from "~/common/logging";
import * as Serializers from "~/node_common/serializers";
import * as Constants from "~/node_common/constants";

import { runQuery } from "~/node_common/data/utilities";

export default async ({ sanitize = false, includeFiles = false } = {}) => {
  return await runQuery({
    label: "GET_EVERY_USER",
    queryFn: async (DB) => {
      // const userFiles = () =>
      //   DB.raw("json_agg(?? order by ?? desc) as ??", ["files", "files.createdAt", "library"]);

      const userFiles = () =>
        DB.raw(
          "coalesce(json_agg(?? order by ?? desc) filter (where ?? is not null), '[]') as ??",
          ["files", "files.createdAt", "files.id", "library"]
        );

      let users;
      if (includeFiles) {
        users = await DB.select(...Serializers.userProperties, userFiles())
          .from("users")
          .leftJoin("files", "files.ownerId", "users.id");
      } else {
        users = await DB.select(...Serializers.userProperties).from("users");
      }

      if (!users || users.error) {
        return [];
      }

      if (sanitize) {
        users = users.map((user) => Serializers.sanitizeUser(user));
      }

      return JSON.parse(JSON.stringify(users));
    },
    errorFn: async (e) => {
      Logging.error({
        error: true,
        decorator: "GET_EVERY_USER",
      });

      return [];
    },
  });
};
