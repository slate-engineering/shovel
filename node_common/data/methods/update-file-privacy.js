import { runQuery } from "~/node_common/data/utilities";

export default async ({ id, ownerId, isPublic }) => {
  return await runQuery({
    label: "UPDATE_FILE_PRIVACY",
    queryFn: async (DB) => {
      if (isPublic === false) {
        //NOTE(martina): if making a file private, remove any activity items involving it
        const activity = await DB("activity").where("fileId", id).del();
        console.log(activity);

        //NOTE(martina): and nullify the fileId in any reposted slates to indicate it is no longer available
        // const repostedSlateFiles = await DB.from("slate_files")
        //   .join("slates", "slates.id", "=", "slate_files.slateId")
        //   .whereNot("slates.ownerId", "=", ownerId)
        //   .where("slate_files.fileId", id)
        //   .update({ "slate_files.fileId": null })
        //   .returning("*");

        const repostedSlateFiles = await DB.from("slate_files")
          .whereIn("id", function () {
            this.select("slate_files.id")
              .from("slate_files")
              .join("slates", "slates.id", "=", "slate_files.slateId")
              .where({ "slate_files.fileId": id })
              .whereNot("slates.ownerId", "=", ownerId);
          })
          .del();
        // .update({ fileId: null })

        //NOTE(martina): and remove it from any of the user's public slates
        const publicSlatesContainingFile = await DB.from("slate_files")
          .whereIn("id", function () {
            this.select("slate_files.id")
              .from("slate_files")
              .join("slates", "slates.id", "=", "slate_files.slateId")
              .where({
                "slates.isPublic": true,
                "slates.ownerId": ownerId,
                "slate_files.fileId": id,
              });
          })
          .del()
          .returning("*");
      }

      const response = await DB.from("files").where("id", id).update({ isPublic }).returning("*");

      const index = response ? response.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "UPDATE_FILE_PRIVACY",
      };
    },
  });
};
