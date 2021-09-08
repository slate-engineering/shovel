import * as Data from "~/node_common/data";
import * as Strings from "~/common/strings";
import * as Utilities from "~/node_common/utilities";

export const checkAuthorizationInternal = async (req, res) => {
  const id = Utilities.getIdFromCookie(req);
  if (!id) {
    return res.status(401).send({ decorator: "SERVER_NOT_AUTHENTICATED", error: true });
  }

  const user = await Data.getUserById({
    id,
  });

  if (!user) {
    return res.status(404).send({
      decorator: "SERVER_USER_NOT_FOUND",
      error: true,
    });
  }

  if (user.error) {
    return res.status(500).send({
      decorator: "SERVER_USER_NOT_FOUND",
      error: true,
    });
  }

  return { id, user };
};

export const checkAuthorizationExternal = async (req, res) => {
  if (Strings.isEmpty(req.headers.authorization)) {
    return res.status(404).send({
      decorator: "NO_API_KEY_PROVIDED",
      error: true,
    });
  }

  const parsed = Strings.getKey(req.headers.authorization);

  const key = await Data.getAPIKeyByKey({
    key: parsed,
  });

  if (!key) {
    return res.status(403).send({
      decorator: "NO_MATCHING_API_KEY_FOUND",
      message: "We could not find that API key in our records",
      error: true,
    });
  }

  if (key.error) {
    return res.status(500).send({
      decorator: "ERROR_WHILE_VERIFYING_API_KEY",
      message: "We ran into an error while verifying that API key. Please try again",
      error: true,
    });
  }

  const user = await Data.getUserById({
    id: key.ownerId,
  });

  if (!user) {
    return res.status(404).send({
      decorator: "API_KEY_OWNER_NOT_FOUND",
      message: "We were unable to find the owner of that API key",
      error: true,
    });
  }

  if (user.error) {
    return res.status(500).send({
      decorator: "ERROR_WHILE_LOCATING_API_KEY_OWNER",
      message:
        "We ran into an error while trying to find the owner of that API key. Please try again",
      error: true,
    });
  }

  return { id: user.id, key, user };
};
