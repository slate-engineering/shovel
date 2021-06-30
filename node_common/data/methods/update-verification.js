import { runQuery } from "~/node_common/data/utilities";

export default async ({ sid, isVerified, passwordChanged }) => {
  return await runQuery({
    label: "UPDATE_VERIFICATION",
    queryFn: async (DB) => {
      const response = await DB.from("verifications")
        .where("sid", sid)
        .update({
          isVerified,
          passwordChanged,
        })
        .returning("*");

      const index = response ? response.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "UPDATE_VERIFICATION",
      };
    },
  });
};
