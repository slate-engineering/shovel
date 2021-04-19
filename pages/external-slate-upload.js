import * as Data from "~/node_common/data";
import * as SearchManager from "~/node_common/managers/search";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Upload from "~/node_common/upload";

export default async (req, res) => {
  if (Strings.isEmpty(req.headers.authorization)) {
    return res.status(404).send({
      decorator: "SERVER_API_KEY_MISSING",
      error: true,
    });
  }

  let slate = await Data.getSlateById({ id: req.params.slate });

  if (!slate) {
    return res.status(404).send({
      decorator: "V1_SERVER_UPLOAD_SLATE_NOT_FOUND",
      error: true,
    });
  }

  if (slate.error) {
    return res.status(500).send({
      decorator: "V1_SERVER_UPLOAD_SLATE_NOT_FOUND",
      error: true,
    });
  }

  const parsed = Strings.getKey(req.headers.authorization);
  const key = await Data.getAPIKeyByKey({
    key: parsed,
  });

  if (!key) {
    return res.status(403).send({
      decorator: "V1_SERVER_API_KEY_NOT_FOUND",
      error: true,
    });
  }

  if (key.error) {
    return res.status(500).send({
      decorator: "V1_SERVER_API_KEY_NOT_FOUND",
      error: true,
    });
  }

  const user = await Data.getUserById({
    id: key.ownerId,
  });

  let uploadResponse = null;
  try {
    uploadResponse = await Upload.formMultipart(req, res, {
      user,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!uploadResponse) {
    return res.status(413).send({ decorator: "V1_SERVER_API_UPLOAD_ERROR", error: true });
  }

  if (uploadResponse.error) {
    ScriptLogging.error(SHOVEL, uploadResponse.message);
    return res.status(413).send({
      decorator: uploadResponse.decorator,
      error: uploadResponse.error,
    });
  }

  const { data } = uploadResponse;

  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid: data.cid });

  if (duplicateFile) {
    return res.status(400).send({ decorator: "V1_SERVER_UPLOAD_FILE_DUPLICATE", error: true });
  }

  const response = await Data.createFile({ ...data, ownerId: user.id });

  if (!response) {
    return res.status(404).send({ decorator: "V1_SERVER_UPLOAD_FAILED", error: true });
  }

  if (response.error) {
    return res.status(500).send({ decorator: response.decorator, error: response.error });
  }

  const addResponse = await Data.createSlateFiles({
    slateId: slate.id,
    ids: response.map((file) => file.id),
  });

  if (!addResponse) {
    return res.status(404).send({ decorator: "V1_SERVER_SLATE_UPLOAD_FAILED", error: true });
  }

  if (addResponse.error) {
    return res.status(500).send({ decorator: response.decorator, error: response.error });
  }

  if (slate.isPublic) {
    const publicFiles = await Data.getFilesByIds({
      ids: [data.id],
      publicOnly: true,
    });

    if (publicFiles.length) {
      SearchManager.updateFile(publicFiles, "ADD");
    }
  }

  return res.status(200).send({
    decorator: "V1_UPLOAD_DATA_TO_SLATE",
    data,
    slate,
  });
};
