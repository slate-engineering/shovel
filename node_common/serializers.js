//NOTE(martina): when you add any new variable to the user, file, or slate objects, add it in these structures
//add it to sanitize___ if it should be sent to the front end
//add it to clean____ if it should be saved to the database

//NOTE(martina): these functions are to remove sensitive information before sending the data to the front end
//only variables listed here will be sent to the front end

export const sanitizeUser = (entity) => {
  return {
    id: entity.id,
    username: entity.username,
    slates: entity.slates, //NOTE(martina): this is not in the database. It is added after
    library: entity.library, //NOTE(martina): this is not in the database. It is added after
    data: {
      name: entity.data?.name,
      photo: entity.data?.photo,
      body: entity.data?.body,
    },
  };
};

export const sanitizeSlate = (entity) => {
  return {
    id: entity.id,
    slatename: entity.slatename,
    ownerId: entity.ownerId,
    isPublic: entity.isPublic,
    objects: entity.objects,
    user: entity.user, //NOTE(martina): this is not in the database. It is added after
    data: {
      name: entity.data?.name,
      body: entity.data?.body,
      preview: entity.data?.preview,
      layouts: entity.data?.layouts,
      tags: entity.data?.tags,
    },
  };
};

export const sanitizeFile = (entity) => {
  return {
    id: entity.id,
    cid: entity.cid,
    ownerId: entity.ownerId,
    isPublic: entity.isPublic,
    filename: entity.filename,
    data: {
      type: entity.data?.type,
      name: entity.data?.name,
      size: entity.data?.size,
      body: entity.data?.body,
      source: entity.data?.source,
      author: entity.data?.author,
      blurhash: entity.data?.blurhash,
      coverImage: entity.data?.coverImage,
      downloads: entity.data?.downloads, //NOTE(martina): newly added
      tags: entity.data?.tags, //NOTE(martina): newly added
      unity: entity.data?.unity, //NOTE(martina): newly added
      link: entity.data?.link, //NOTE(martina): newly added
    },
  };
};

//NOTE(martina): these functions are to remove extraneous information before updating the database entry.
//Only variables included here will be added to the database

export const cleanUser = (entity) => {
  return {
    id: entity.id,
    username: entity.username,
    createdAt: entity.createdAt,
    lastActive: entity.lastActive,
    salt: entity.salt,
    password: entity.password,
    email: entity.email,
    data: entity.data,
    // data: {
    //   name: entity.data?.name,
    //   photo: entity.data?.photo,
    //   body: entity.data?.body,
    //   tokens: entity.data?.tokens,
    //   settings: entity.data?.settings,
    //   onboarding: entity.data?.onboarding,
    //   status: entity.data?.status,
    //   library: entity.data?.library, //MIGRATION: take this out after
    // },
  };
};

export const cleanSlate = (entity) => {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    slatename: entity.slatename,
    isPublic: entity.isPublic,
    ownerId: entity.ownerId,
    data: entity.data,
    // data: {
    //   name: entity.data?.name,
    //   body: entity.data?.body,
    //   preview: entity.data?.preview,
    //   layouts: entity.data?.layouts,
    //   tags: entity.data?.tags,
    //   objects: entity.data?.objects, //MIGRATION: take this out after
    // },
  };
};

export const cleanFile = (entity) => {
  return {
    id: entity.id,
    cid: entity.cid,
    createdAt: entity.createdAt,
    ownerId: entity.ownerId,
    isPublic: entity.isPublic,
    filename: entity.filename,
    data: entity.data,
    // data: {
    //   type: entity.data?.type,
    //   name: entity.data?.name,
    //   size: entity.data?.size,
    //   body: entity.data?.body,
    //   source: entity.data?.source,
    //   author: entity.data?.author,
    //   blurhash: entity.data?.blurhash,
    //   coverImage: entity.data?.coverImage,
    //   downloads: entity.data?.downloads,
    //   tags: entity.data?.tags,
    //   unity: entity.data?.unity,
    //   link: entity.data?.link,
    // },
  };
};

//NOTE(martina): these functions are used to get the updated object that is obtained by merging the old and new objects
// and using the above cleaning functions to strip out things that should not be in the database or should not be mutated

export const getUpdatedSlate = (oldSlate, updates) => {
  let updatedSlate = cleanSlate(updates);
  return { ...oldSlate, ...updatedSlate, data: { ...oldSlate.data, ...updatedSlate.data } };
};

export const getUpdatedFile = (oldFile, updates) => {
  let updatedFile = cleanFile(updates);
  return { ...oldFile, ...updatedFile, data: { ...oldFile.data, ...updatedFile.data } };
};

export const getUpdatedUser = (oldUser, updates) => {
  let updatedUser = cleanUser(updates);
  return { ...oldUser, ...updatedUser, data: { ...oldUser.data, ...updatedUser.data } };
};
