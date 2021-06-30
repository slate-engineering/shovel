import { runQuery } from "~/node_common/data/utilities";

export default async ({ token, email, id, screen_name, verified }) => {
  return await runQuery({
    label: "UPDATE_TWITTER_TOKEN",
    queryFn: async (DB) => {
      const response = await DB.from("twitterTokens")
        .where("token", token)
        .update({
          email,
          id_str: id,
          screen_name,
          verified: verified,
        })
        .returning("*");

      const index = response ? response.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "UPDATE_TWITTER_TOKEN",
      };
    },
  });
};
