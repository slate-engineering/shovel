import * as Data from "~/node_common/data";
import * as Constants from "~/node_common/constants";
import * as LibraryManager from "~/node_common/managers/library";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Upload from "~/node_common/upload";

export default async (req, res) => {
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
      decorator: "API_KEY_NOT_FOUND",
      error: true,
    });
  }

  if (key.error) {
    return res.status(500).send({
      decorator: "API_KEY_NOT_FOUND",
      error: true,
    });
  }

  const user = await Data.getUserById({
    id: key.ownerId,
  });

  if (!user) {
    return res.status(404).send({ decorator: "API_KEY_CORRESPONDING_USER_NOT_FOUND", error: true });
  }

  if (user.error) {
    return res.status(404).send({ decorator: "API_KEY_CORRESPONDING_USER_NOT_FOUND", error: true });
  }

  let uploadResponse = null;
  try {
    uploadResponse = await Upload.formMultipart(req, res, {
      user,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!uploadResponse) {
    return res.status(413).send({ decorator: "UPLOAD_ERROR", error: true });
  }

  if (uploadResponse.error) {
    ScriptLogging.error(SHOVEL, uploadResponse.message);
    return res.status(413).send({
      decorator: uploadResponse.decorator,
      error: uploadResponse.error,
    });
  }

  const { data } = uploadResponse;
  let file = data;

  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid: data.cid });

  if (!duplicateFile) {
    const response = await Data.createFile({ files: data, owner: user });

    if (!response) {
      return res.status(404).send({ decorator: "CREATE_FILE_FAILED", error: true });
    }

    if (response.error) {
      return res.status(500).send({ decorator: response.decorator, error: response.error });
    }
  } else {
    file = duplicateFile;
  }

  return res.status(200).send({
    decorator: "V2_UPLOAD",
    data: file,
  });
};
