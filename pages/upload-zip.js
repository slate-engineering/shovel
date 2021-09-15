import * as Upload from "~/node_common/upload-zip";
import * as Utilities from "~/node_common/utilities";
import * as Data from "~/node_common/data";
import * as LibraryManager from "~/node_common/managers/library";
import * as ScriptLogging from "~/node_common/script-logging";

import * as Strings from "~/common/strings";

const SHOVEL = "SHOVEL          ";

export default async (req, res) => {
  if (Strings.isEmpty(req.params.upload)) {
    return res.status(404).json({
      decorator: "SERVER_FILE_MISSING",
      error: true,
    });
  }

  if (Strings.isEmpty(req.headers.authorization)) {
    return res.status(404).json({
      decorator: "SERVER_API_KEY_MISSING",
      error: true,
    });
  }

  const id = Utilities.decodeCookieToken(req.headers.authorization);

  if (Strings.isEmpty(id)) {
    return res.status(403).json({
      decorator: "SERVER_AUTHENTICATION_MISSING",
      error: true,
    });
  }

  const user = await Data.getUserById({
    id,
  });

  if (!user || user.error) {
    return res.status(403).json({ decorator: "UPLOAD_NOT_ALLOWED", error: true });
  }

  console.log(`[upload] zip upload for ${user.username} started`);

  let response = null;
  try {
    response = await Upload.formMultipart(req, res, {
      user,
      originalFileName: req.params.upload,
    });
    console.log(`[upload] upload for ${user.username} responded`);
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!response) {
    console.log(`[upload] upload for ${user.username} unsuccessful`);
    return res.status(500).json({ decorator: "SERVER_UPLOAD_ERROR", error: true });
  }

  if (response.error) {
    // NOTE(jim): To debug potential textile issues with matching CIDs.
    console.log(`[upload] upload for ${user.username} unsuccessful`);
    console.log({ message: response.message });
    return res.status(500).json({ decorator: response.decorator, error: response.error });
  }

  console.log(`[upload] upload for ${user.username} successful`);

  const { data } = response;

  return res.status(200).send({
    decorator: "SERVER_UPLOAD",
    data: {
      data,
      owner_user_id: user.id,
    },
  });
};
