import { runQuery } from "~/node_common/data/utilities";

export default async ({ token }) => {
  return await runQuery({
    label: "GET_TWITTER_TOKEN",
    queryFn: async (DB) => {
      const query = await DB.select("*").from("twitterTokens").where({ token }).first();

      if (!query || query.error) {
        return null;
      }

      if (query.token) {
        return JSON.parse(JSON.stringify(query));
      }

      return null;
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_TWITTER_TOKEN",
      };
    },
  });
};
