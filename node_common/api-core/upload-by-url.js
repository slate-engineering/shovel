import * as Data from "~/node_common/data";
import * as Constants from "~/node_common/constants";
import * as LibraryManager from "~/node_common/managers/library";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as UploadByUrl from "~/node_common/upload-by-url";
import * as RequestUtilities from "~/node_common/request-utilities";

export const uploadByUrl = async (req, res) => {
  const userInfo = await RequestUtilities.checkAuthorizationExternal(req, res);
  if (!userInfo) return;
  const { id, key, user } = userInfo;

  const url = req.body.data?.url;
  const filename = req.body.data?.filename;

  if (Strings.isEmpty(url)) {
    return res.status(400).json({
      decorator: "SERVER_URL_MISSING",
      error: true,
    });
  }

  let uploadResponse = null;
  try {
    uploadResponse = await UploadByUrl.upload(req, res, {
      filename,
      user,
      url,
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

  const { data: file } = uploadResponse;

  let updatedFile;
  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid: file.cid });

  if (!duplicateFile) {
    const response = await Data.createFile({ owner: user, files: file });

    if (!response) {
      return res.status(404).send({ decorator: "CREATE_FILE_FAILED", error: true });
    }

    if (response.error) {
      return res.status(500).send({ decorator: response.decorator, error: true });
    }

    updatedFile = response;
  } else {
    updatedFile = duplicateFile;
  }

  return { file: updatedFile };
};
