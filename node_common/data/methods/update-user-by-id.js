import * as Serializers from "~/node_common/serializers";

import { runQuery } from "~/node_common/data/utilities";

export default async ({
  id,
  data,
  lastActive,
  username,
  email,
  salt,
  password,
  twitterId,
  authVersion,
}) => {
  const updateObject = { id, lastActive: lastActive || new Date() };

  if (data) {
    updateObject.data = data;
  }

  if (username) {
    updateObject.username = username.toLowerCase();
  }

  if (email) {
    updateObject.email = email.toLowerCase();
  }

  if (salt) {
    updateObject.salt = salt;
  }

  if (password) {
    updateObject.password = password;
  }

  if (twitterId) {
    updateObject.twitterId = twitterId;
  }

  if (authVersion) {
    updateObject.authVersion = authVersion;
  }

  return await runQuery({
    label: "UPDATE_USER_BY_ID",
    queryFn: async (DB) => {
      let currentUser = await DB.from("users").where("id", id).first();

      if (!currentUser || currentUser.error) {
        return {
          error: true,
          decorator: "UPDATE_USER_BY_ID_USER_NOT_FOUND",
        };
      }

      let updatedUser = Serializers.getUpdatedUser(currentUser, updateObject);

      const query = await DB.from("users").where("id", id).update(updatedUser).returning("*");

      const index = query ? query.pop() : null;
      return JSON.parse(JSON.stringify(index));
    },
    errorFn: async (e) => {
      return {
        error: true,
        decorator: "UPDATE_USER_BY_ID",
      };
    },
  });
};
