import * as Data from "~/node_common/data";
import * as SearchManager from "~/node_common/managers/search";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Upload from "~/node_common/upload";
import * as RequestUtilities from "~/node_common/request-utilities";
import * as Utilities from "~/node_common/utilities";

export const slateUpload = async (req, res) => {
  const userInfo = await RequestUtilities.checkAuthorizationExternal(req, res);
  if (!userInfo) return;
  const { id, key, user } = userInfo;

  let slate = await Data.getSlateById({ id: req.params.slate, includeFiles: true, sanitize: true });

  if (!slate) {
    return res.status(404).send({
      decorator: "SLATE_NOT_FOUND",
      message: `We were unable to find a collection with the id ${req.params.slate}`,
      error: true,
    });
  }

  if (slate.error) {
    return res.status(500).send({
      decorator: "SLATE_NOT_FOUND",
      message: "We ran into a server error while trying to find that slate. Please try again later",
      error: true,
    });
  }

  if (user.id !== slate.ownerId) {
    return res.status(400).send({
      decorator: "NOT_SLATE_OWNER_UPLOAD_TO_SLATE_NOT_ALLOWED",
      message: `Upload to collection with id ${req.params.slate} not allowed. You are not the owner of this collection`,
      error: true,
    });
  }

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

  const duplicateFile = await Data.getFileByCid({ ownerId: user.id, cid });
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

  const { decorator: returnedDecorator, added: addedToSlate } = await Utilities.addToSlate({
    slate,
    files: [file],
    user,
  });

  if (returnedDecorator) {
    return res.status(500).send({
      decorator: returnedDecorator,
      message:
        "We uploaded the file, but ran into an error while adding that file to the collection",
      error: true,
    });
  }

  return { file, slate };
};
