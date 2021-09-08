import * as Data from "~/node_common/data";
import * as Constants from "~/node_common/constants";
import * as LibraryManager from "~/node_common/managers/library";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Upload from "~/node_common/upload";
import * as RequestUtilities from "~/node_common/request-utilities";

export const upload = async (req, res) => {
  const userInfo = await RequestUtilities.checkAuthorizationExternal(req, res);
  if (!userInfo) return;
  const { id, key, user } = userInfo;

  let uploadResponse = null;
  try {
    uploadResponse = await Upload.formMultipart(req, res, {
      user,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!uploadResponse || uploadResponse.error) {
    ScriptLogging.error(SHOVEL, uploadResponse.message);
    return res.status(500).send({
      decorator: uploadResponse?.decorator || "UPLOAD_FAILED",
      message: "We ran into an issue while uploading that file",
      error: uploadResponse.error,
    });
  }

  const { data } = uploadResponse;
  let file = data;

  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid: data.cid });

  if (!duplicateFile) {
    const response = await Data.createFile({ files: data, owner: user });

    if (!response) {
      return res.status(404).send({
        decorator: "CREATE_FILE_FAILED",
        message: "We ran into an error while creating that file",
        error: true,
      });
    }

    if (response.error) {
      return res.status(500).send({
        decorator: response.decorator,
        message: "We ran into an error while creating that file",
        error: response.error,
      });
    }

    file = response;
  } else {
    file = duplicateFile;
  }

  return { file };
};
