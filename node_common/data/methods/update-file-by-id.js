import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): if updating privacy, use the separate update-file-privacy function which will remove it from activity and slates as well

//NOTE(martina): you can pass in an update object whose data component is incomplete (e.g. data: { name: "New name" }) without accidentally
//wiping the rest of data b/c this updater method overlays it over the current value for data

export default async ({ id, data }) => {
  const updateObject = { id };

  if (data) {
    updateObject.data = data;
  }

  return await runQuery({
    label: "UPDATE_FILE_BY_ID",
    queryFn: async (DB) => {
      let currentFile = await DB.from("files").where("id", id).first();

      if (!currentFile || currentFile.error) {
        return {
          error: true,
          decorator: "UPDATE_FILE_BY_ID_FILE_NOT_FOUND",
        };
      }

      let updatedFile = Serializers.getUpdatedFile(currentFile, updateObject);

      const response = await DB.from("files").where("id", id).update(updatedFile).returning("*");
      const index = response ? response.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "UPDATE_FILE_BY_ID",
      };
    },
  });
};
