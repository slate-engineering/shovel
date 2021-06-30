import { runQuery } from "~/node_common/data/utilities";

//NOTE(toast): allows for creation of mulitple codes and just
//passing the sid for the most recent verification session
export default async ({ email, pin, twitterToken, username, type }) => {
  return await runQuery({
    label: "CREATE_VERIFICATION",
    queryFn: async (DB) => {
      const query = await DB.insert({
        email,
        pin,
        username,
        twitterToken,
        type,
      })
        .into("verifications")
        .returning("*");

      const index = query ? query.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "CREATE_VERIFICATION",
      };
    },
  });
};
