import * as UploadByUrl from "~/node_common/upload-by-url";
import * as Utilities from "~/node_common/utilities";
import * as Data from "~/node_common/data";
import * as LibraryManager from "~/node_common/managers/library";
import * as ScriptLogging from "~/node_common/script-logging";

import * as Strings from "~/common/strings";

const SHOVEL = "SHOVEL          ";

export default async (req, res, options) => {
  const url = req.body.data?.url;
  if (Strings.isEmpty(url)) {
    return res.status(400).json({
      decorator: "SERVER_URL_MISSING",
      error: true,
    });
  }

  if (Strings.isEmpty(req.headers.authorization)) {
    return res.status(401).json({
      decorator: "SERVER_API_KEY_MISSING",
      error: true,
    });
  }

  const id = Utilities.decodeCookieToken(req.headers.authorization);

  if (Strings.isEmpty(id)) {
    return res.status(401).json({
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

  let response = null;
  try {
    response = await UploadByUrl.upload(req, res, {
      user,
      url,
      bucketName: options ? options.bucketName : null,
    });
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
  }

  if (!response) {
    return res.status(413).json({ decorator: "UPLOAD_ERROR", error: true });
  }

  if (response.error) {
    return res.status(413).json({ decorator: response.decorator, error: true });
  }

  const { data: file } = response;

  const { updateType, targetId } = req.body.data;

  let updatedFile;

  if (updateType) {
    if (updateType === "COVER_IMAGE") {
      updatedFile = await Data.updateFileById({ id: targetId, data: { coverImage: file } });
      // const currentFile = await Data.getFileById({ id: targetId });
      // if (currentFile && !currentFile.error) {
      //   const coverImage = currentFile.data.coverImage;
      //   delete coverImage.url;
      //   coverImage.cid = cid;
      //   const updatedFile = await Data.updateFileById({ id: targetId, data: { coverImage } });
      //   console.log(updatedFile);
      // }
    }
  } else {
    const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid: file.cid });

    if (!duplicateFile) {
      updatedFile = await Data.createFile({ owner: user, files: [file] });
    } else {
      updatedFile = duplicateFile;
    }
  }

  if (!updatedFile || updatedFile.error) {
    return res.status(500).json({ decorator: "UPLOAD_UPDATE_FILES_ERROR", error: true });
  }

  return res.status(200).json({
    decorator: "SERVER_UPLOAD",
    data: {
      data: updatedFile, //should this be file instead?
      owner_user_id: user.id,
    },
  });
};
