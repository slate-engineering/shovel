import * as Data from "~/node_common/data";
import * as SearchManager from "~/node_common/managers/search";
import * as Strings from "~/common/strings";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Upload from "~/node_common/upload";

export default async (req, res) => {
  if (Strings.isEmpty(req.headers.authorization)) {
    return res.status(404).send({
      decorator: "API_KEY_MISSING",
      error: true,
    });
  }

  let slate = await Data.getSlateById({ id: req.params.slate, includeFiles: true, sanitize: true });

  if (!slate) {
    return res.status(404).send({
      decorator: "SLATE_NOT_FOUND",
      error: true,
    });
  }

  if (slate.error) {
    return res.status(500).send({
      decorator: "SLATE_NOT_FOUND",
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

  if (user.id !== slate.ownerId) {
    return res
      .status(400)
      .send({ decorator: "NOT_SLATE_OWNER_UPLOAD_TO_SLATE_NOT_ALLOWED", error: true });
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
    return res.status(413).send({ decorator: "UPLOAD_FAILED", error: true });
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

  let duplicateCids = await Data.getSlateFilesByCids({
    slateId: slate.id,
    cids: [data.cid],
  });

  if (!duplicateCids.length) {
    const addResponse = await Data.createSlateFiles({
      owner: user,
      slate,
      files: [data],
    });

    if (!addResponse) {
      return res.status(404).send({ decorator: "ADD_TO_SLATE_FAILED", error: true });
    }

    if (addResponse.error) {
      return res.status(500).send({ decorator: addResponse.decorator, error: addResponse.error });
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
  }

  let reformattedData = {
    ...file,
    ...file.data,
    data: null,
  };

  let reformattedObjects = slate.objects.map((obj) => {
    return {
      ...obj,
      ...obj.data,
      data: null,
      url: Strings.getURLfromCID(obj.cid),
    };
  });

  let reformattedSlate = {
    id: slate.id,
    updated_at: slate.updatedAt,
    created_at: slate.createdAt,
    slatename: slate.slatename,
    data: {
      name: slate.data.name,
      public: slate.isPublic,
      objects: reformattedObjects,
      ownerId: slate.ownerId,
      layouts: slate.data.layouts,
    },
  };

  return res.status(200).send({
    decorator: "V1_UPLOAD_TO_SLATE",
    data: reformattedData,
    slate: reformattedSlate,
  });
};
