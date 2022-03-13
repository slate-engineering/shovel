import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): remember to include an ownerId for the file
export default async ({ owner, files, saveCopy = false }) => {
  let inputFiles;
  if (Array.isArray(files)) {
    inputFiles = files;
  } else {
    inputFiles = [files];
  }
  inputFiles = inputFiles.map((file) => {
    file.ownerId = owner.id;
    return file;
  });

  return await runQuery({
    label: "CREATE_FILE",
    queryFn: async (DB) => {
      let query = await DB.insert(inputFiles).into("files").returning("*");

      let activityItems = [];
      if (query) {
        for (let file of query) {
          if (file.isPublic) {
            activityItems.push({
              ownerId: owner.id,
              fileId: file.id,
              type: saveCopy ? "SAVE_COPY" : "CREATE_FILE",
            });
          } else {
            activityItems.push({
              ownerId: owner.id,
              fileId: file.id,
              type: saveCopy ? "SAVE_COPY" : "CREATE_FILE",
              ignore: true,
            });
          }
        }
      }

      if (activityItems.length) {
        const activityQuery = await DB.insert(activityItems).into("activity");
      }

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
