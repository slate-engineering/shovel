import * as Upload from "~/node_common/upload";
import * as Utilities from "~/node_common/utilities";
import * as Data from "~/node_common/data";
import * as LibraryManager from "~/node_common/managers/library";
import * as ScriptLogging from "~/node_common/script-logging";
import * as RequestUtilities from "~/node_common/request-utilities";
import * as Strings from "~/common/strings";

const SHOVEL = "SHOVEL          ";

export default async (req, res, options) => {
  const userInfo = await RequestUtilities.checkAuthorizationInternal(req, res);
  if (!userInfo) return;
  const { id, key, user } = userInfo;

  if (Strings.isEmpty(req.params.upload)) {
    return res.status(404).json({
      decorator: "SERVER_FILE_MISSING",
      error: true,
    });
  }

  let response = null;
  try {
    response = await Upload.formMultipart(req, res, {
      user,
      originalFileName: req.params.upload,
      bucketName: options ? options.bucketName : null,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!response) {
    return res.status(500).json({ decorator: "SERVER_UPLOAD_ERROR", error: true });
  }

  if (response.error) {
    return res.status(500).json({ decorator: response.decorator, error: response.error });
  }

  const { data } = response;

  return res.status(200).json({
    decorator: "SERVER_UPLOAD",
    data: {
      data,
      owner_user_id: user.id,
    },
  });
};
