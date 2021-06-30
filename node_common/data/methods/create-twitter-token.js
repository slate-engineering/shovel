import { runQuery } from "~/node_common/data/utilities";

export default async ({ token, tokenSecret }) => {
  return await runQuery({
    label: "CREATE_TWITTER_TOKEN",
    queryFn: async (DB) => {
      const query = await DB.insert({
        token,
        tokenSecret,
      })
        .into("twitterTokens")
        .returning("*");

      const index = query ? query.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_TWITTER_TOKEN",
      };
    },
  });
};
