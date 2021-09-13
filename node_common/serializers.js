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

//NOTE(martina): the user public properties list filters out sensitive information
export const userPublicProperties = [
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

//NOTE(martina): the user preview properties list contains the minimal info needed to preview the owner of a file or slate
export const userPreviewProperties = ["users.id", "users.name", "users.username", "users.photo"];
