import * as Data from "~/node_common/data";
import * as Constants from "~/node_common/constants";
import * as LibraryManager from "~/node_common/managers/library";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as UploadByCid from "~/node_common/upload-by-cid";
import * as RequestUtilities from "~/node_common/request-utilities";

export const uploadByCid = async (req, res) => {
  const userInfo = await RequestUtilities.checkAuthorizationExternal(req, res);
  if (!userInfo) return;
  const { id, key, user } = userInfo;

  const cid = req.body.data?.cid;
  const filename = req.body.data?.filename;

  if (Strings.isEmpty(cid)) {
    return res.status(400).json({
      decorator: "NO_CID_PROVIDED",
      error: true,
    });
  }

  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid });
  if (duplicateFile) {
    return { file: duplicateFile };
  }

  let uploadResponse = null;
  try {
    uploadResponse = await UploadByCid.upload(req, res, {
      filename,
      user,
      cid,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!uploadResponse) {
    return;
  }

  const { data: file } = uploadResponse;

  const response = await Data.createFile({ owner: user, files: file });

  if (!response) {
    return res.status(404).send({ decorator: "CREATE_FILE_FAILED", error: true });
  }

  if (response.error) {
    return res.status(500).send({ decorator: response.decorator, error: true });
  }

  return { file };
};
