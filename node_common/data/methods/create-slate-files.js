import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): this is the endpoint used when adding an existing file to a slate. Creates a slate_files entry
export default async (slateFiles) => {
  return await runQuery({
    label: "CREATE_SLATE_FILES",
    queryFn: async (DB) => {
      const query = await DB.insert(slateFiles).into("slate_files").returning("*");

      if (!query) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_SLATE_FILES",
      };
    },
  });
};
