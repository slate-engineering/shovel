import * as Strings from "~/common/strings";

//NOTE(martina): V1

export const convertToV1User = (user) => {
  return {
    id: user.id,
    username: user.username,
    data: {
      name: user.name,
      photo: user.photo,
      body: user.body,
    },
  };
};

export const convertToV1Slate = (slate) => {
  let reformattedSlate = {
    id: slate.id,
    updated_at: slate.updatedAt,
    created_at: slate.createdAt,
    slatename: slate.slatename,
    data: {
      name: slate.name,
      public: slate.isPublic,
      ownerId: slate.ownerId,
    },
  };
  if (slate.objects) {
    reformattedSlate.objects = slate.objects.map((obj) => convertToV1File(obj));
  }
  return reformattedSlate;
};

export const convertToV1File = (file) => {
  return {
    id: file.id,
    cid: file.cid,
    url: Strings.getURLfromCID(file.cid),
    name: file.filename,
    size: file.size,
    type: file.type,
    title: file.name,
    ownerId: file.ownerId,
    blurhash: file.blurhash,
    source: file.source,
    body: file.body,
    public: file.isPublic,
    author: file.author,
    linkName: file.linkName,
    linkBody: file.linkBody,
    linkAuthor: file.linkAuthor,
    linkSource: file.linkSource,
    linkDomain: file.linkDomain,
    linkImage: file.linkImage,
    linkFavicon: file.linkFavicon,
  };
};

//NOTE(martina): V2

export const convertToV2User = (user) => {
  return {
    id: user.id,
    username: user.username,
    data: {
      name: user.name,
      photo: user.photo,
      body: user.body,
    },
  };
};

export const convertToV2Slate = (slate) => {
  let reformattedSlate = {
    id: slate.id,
    updatedAt: slate.updatedAt,
    createdAt: slate.createdAt,
    slatename: slate.slatename,
    isPublic: slate.isPublic,
    ownerId: slate.ownerId,
    data: {
      name: slate.name,
      body: slate.body,
    },
  };
  if (slate.objects) {
    reformattedSlate.objects = slate.objects.map((obj) => convertToV2File(obj));
  }
  return reformattedSlate;
};

export const convertToV2File = (file) => {
  return {
    id: file.id,
    cid: file.cid,
    url: Strings.getURLfromCID(file.cid),
    filename: file.filename,
    ownerId: file.ownerId,
    data: {
      name: file.name,
      blurhash: file.blurhash,
      size: file.size,
      type: file.type,
      source: file.source,
      body: file.body,
      author: file.author,
      linkName: file.linkName,
      linkBody: file.linkBody,
      linkAuthor: file.linkAuthor,
      linkSource: file.linkSource,
      linkDomain: file.linkDomain,
      linkImage: file.linkImage,
      linkFavicon: file.linkFavicon,
    },
  };
};

//NOTE(martina): V3. Since this is the current version, it simply cleans any extraneous info rather than reformatting at all

export const convertToV3User = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    photo: user.photo,
    body: user.body,
  };
};

export const convertToV3Slate = (slate) => {
  let reformattedSlate = {
    id: slate.id,
    updatedAt: slate.updatedAt,
    createdAt: slate.createdAt,
    slatename: slate.slatename,
    isPublic: slate.isPublic,
    ownerId: slate.ownerId,
    name: slate.name,
    body: slate.body,
  };
  if (slate.objects) {
    reformattedSlate.objects = slate.objects.map((obj) => convertToV3File(obj));
  }
  return reformattedSlate;
};

export const convertToV3File = (file) => {
  return {
    id: file.id,
    cid: file.cid,
    url: Strings.getURLfromCID(file.cid),
    filename: file.filename,
    ownerId: file.ownerId,
    name: file.name,
    blurhash: file.blurhash,
    size: file.size,
    type: file.type,
    source: file.source,
    body: file.body,
    author: file.author,
    linkName: file.linkName,
    linkBody: file.linkBody,
    linkAuthor: file.linkAuthor,
    linkSource: file.linkSource,
    linkDomain: file.linkDomain,
    linkImage: file.linkImage,
    linkFavicon: file.linkFavicon,
  };
};
