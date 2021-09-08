import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

//NOTE(martina): if you include an ownerId, this will return a single entry since there are no duplicate cids within a user's files
//if you don't include an ownerId, this will return an array of entries since multiple users can have the same file
export default async ({ ownerId, cid }) => {
  return await runQuery({
    label: "GET_FILE_BY_CID",
    queryFn: async (DB) => {
      let query;
      if (ownerId) {
        query = await DB.select("*").from("files").where({ ownerId, cid }).first();
      } else {
        query = await DB.select("*").from("files").where({ cid });
      }

      if (!query || query.error) {
        return null;
      }

      return JSON.parse(JSON.stringify(query));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_FILE_BY_CID",
      };
    },
  });
};
