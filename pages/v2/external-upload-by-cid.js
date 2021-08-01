import * as Data from "~/node_common/data";
import * as Constants from "~/node_common/constants";
import * as LibraryManager from "~/node_common/managers/library";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as UploadByCid from "~/node_common/upload-by-cid";

const SHOVEL = "SHOVEL          ";

export default async (req, res) => {
  const cid = req.body.data?.cid;

  if (Strings.isEmpty(cid)) {
    return res.status(400).json({
      decorator: "NO_CID_PROVIDED",
      error: true,
    });
  }

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

  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid });
  if (duplicateFile) {
    return res.status(200).send({
      decorator: "V2_UPLOAD",
      data: duplicateFile,
    });
  }

  let uploadResponse = null;
  try {
    uploadResponse = await UploadByCid.upload(req, res, {
      user,
      cid,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!uploadResponse) {
    return res.status(400).send({ decorator: "UPLOAD_ERROR", error: true });
  }

  if (uploadResponse.error) {
    ScriptLogging.error(SHOVEL, uploadResponse.message);
    return res.status(400).send({
      decorator: uploadResponse.decorator,
      error: uploadResponse.error,
    });
  }

  const { data: file } = uploadResponse;

  const response = await Data.createFile({ owner: user, files: [file] });

  if (!response) {
    return res.status(404).send({ decorator: "CREATE_FILE_FAILED", error: true });
  }

  if (response.error) {
    return res.status(500).send({ decorator: response.decorator, error: true });
  }

  return res.status(200).send({
    decorator: "V2_UPLOAD",
    data: response,
  });
};
