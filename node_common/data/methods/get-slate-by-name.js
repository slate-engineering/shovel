import { runQuery } from "~/node_common/data/utilities";

export default async ({ slatename, ownerId, username, includeFiles = false }) => {
  return await runQuery({
    label: "GET_SLATE_BY_NAME",
    queryFn: async (DB) => {
      let id = ownerId;
      if (username && !ownerId) {
        const user = await DB.select("id").from("users").where({ username }).first();

        if (!user || user.error) {
          return null;
        }

        id = user.id;
      }

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
          .where({ "slates.slatename": slatename, "slates.ownerId": id })
          .groupBy("slates.id")
          .first();
      } else {
        query = await DB.select("*").from("slates").where({ slatename, ownerId: id }).first();
      }

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_SLATE_BY_NAME",
      };
    },
  });
};
