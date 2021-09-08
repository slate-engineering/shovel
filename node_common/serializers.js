//NOTE(martina): add a variable to sanitizeUser if it should be sent to the front end. Otherwise, it will be filtered out

export const sanitizeUser = (user) => {
  return {
    id: user.id,
    createdAt: user.createdAt,
    lastActive: user.lastActive,
    username: user.username,
    slates: user.slates, //NOTE(martina): this is not in the database. It is added after
    library: user.library, //NOTE(martina): this is not in the database. It is added after
    name: user.name,
    body: user.body,
    photo: user.photo,
    followerCount: user.followerCount,
    slateCount: user.slateCount,
    twitterUsername: user.twitterUsername,
    twitterVerified: user.twitterVerified,
  };
};

//NOTE(martina): list of the properties of the tables that should be returned by db queries. Convenience so we don't have to write these out each time and update in multiple places
export const slateProperties = [
  "slates.id",
  "slates.ownerId",
  "slates.createdAt",
  "slates.updatedAt",
  "slates.slatename",
  "slates.body",
  "slates.name",
  "slates.preview",
  "slates.isPublic",
  "slates.subscriberCount",
  "slates.fileCount",
];

//NOTE(martina): the user properties list filters out sensitive information
export const userProperties = [
  "users.id",
  "users.createdAt",
  "users.lastActive",
  "users.username",
  "users.name",
  "users.body",
  "users.photo",
  "users.slateCount",
  "users.followerCount",
  "users.twitterUsername",
  "users.twitterVerified",
];

export const fileProperties = [
  "files.id",
  "files.ownerId",
  "files.createdAt",
  "files.cid",
  "files.isPublic",
  "files.filename",
  "files.name",
  "files.body",
  "files.size",
  "files.type",
  "files.blurhash",
  "files.data",
  "files.source",
  "files.author",
  "files.coverImage",
  "files.downloadCount",
  "files.saveCount",
  "files.isLink",
  "files.url",
  "files.linkName",
  "files.linkBody",
  "files.linkAuthor",
  "files.linkSource",
  "files.linkDomain",
  "files.linkImage",
  "files.linkFavicon",
  "files.linkHtml",
  "files.linkIFrameAllowed",
  "files.tags",
];
