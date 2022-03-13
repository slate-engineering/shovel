import { runQuery } from "~/node_common/data/utilities";

/**
 * Gets the files in the slate with id SLATEID that have a cid in CIDS. Used to check for
 * duplicate cid files in a slate before adding a file to a slate
 */
export default async ({ slateId, cids }) => {
  return await runQuery({
    label: "GET_SLATE_FILES_BY_CID",
    queryFn: async (DB) => {
      const query = await DB.select("files.*")
        .from("files")
        .join("slate_files", "slate_files.fileId", "=", "files.id")
        .where("slate_files.slateId", slateId)
        .whereIn("files.cid", cids)
        .groupBy("files.id");

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_SLATE_FILES_BY_CID",
      };
    },
  });
};
