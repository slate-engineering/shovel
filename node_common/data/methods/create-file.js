import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): remember to include an ownerId for the file
export default async (files) => {
  const cleanedFiles = files.map((file) => Serializers.cleanFile(file));

  return await runQuery({
    label: "CREATE_FILE",
    queryFn: async (DB) => {
      let query = await DB.insert(cleanedFiles).into("files").returning("*");

      if (!query) {
        return null;
      }

      if (!Array.isArray(files)) {
        query = query.pop();
      }
      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_FILE",
      };
    },
  });
};
