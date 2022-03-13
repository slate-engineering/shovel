import { runQuery } from "~/node_common/data/utilities";

export default async ({ id, includeFiles = false }) => {
  return await runQuery({
    label: "GET_SLATE_BY_ID",
    queryFn: async (DB) => {
      // const slateFiles = () =>
      //   DB.raw("json_agg(?? order by ?? asc) as ??", ["files", "slate_files.createdAt", "objects"]);
      const slateFiles = () =>
        DB.raw("coalesce(json_agg(?? order by ?? asc) filter (where ?? is not null), '[]') as ??", [
          "files",
          "slate_files.createdAt",
          "files.id",
          "objects",
        ]);

      let query;

      if (includeFiles) {
        query = await DB.select("slates.*", slateFiles())
          .from("slates")
          .leftJoin("slate_files", "slate_files.slateId", "=", "slates.id")
          .leftJoin("files", "slate_files.fileId", "=", "files.id")
          .where({ "slates.id": id })
          .groupBy("slates.id")
          .first();
      } else {
        query = await DB.select("*").from("slates").where({ id }).first();
      }

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_SLATE_BY_ID",
      };
    },
  });
};
