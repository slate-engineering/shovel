import * as Serializers from "~/node_common/serializers";
import { runQuery } from "~/node_common/data/utilities";

export default async () => {
  return await runQuery({
    label: "GET_ALL_SENDGRID_CONTACTS",
    queryFn: async (DB) => {
      let query = await DB.select("id", "username", "email").from("users").whereNotNull("email");

      if (!query || query.error) {
        return null;
      }

      let formatted = query.map((user) => {
        return {
          email: user.email,
          custom_fields: {
            w4_T: user.id,
            w5_T: user.username,
          },
        };
      });

      return JSON.parse(JSON.stringify(formatted));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "GET_ALL_SENDGRID_CONTACTS",
      };
    },
  });
};
