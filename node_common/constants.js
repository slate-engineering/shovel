// NOTE(toast): 30 GB from jim/martina/ignacio
export const TEXTILE_ACCOUNT_BYTE_LIMIT = 1073741824 * 30;

// NOTE(jim): 30 GB - minus .textileseed
export const TEXTILE_BUCKET_LIMIT = TEXTILE_ACCOUNT_BYTE_LIMIT - 234;

// NOTE(jim): 100mb
export const MIN_ARCHIVE_SIZE_BYTES = 104857600;
export const IPFS_GATEWAY_URL = "https://slate.textile.io/ipfs";

export const slateProperties = [
  "slates.id",
  "slates.slatename",
  "slates.data",
  "slates.ownerId",
  "slates.isPublic",
  "slates.subscriberCount",
  "slates.fileCount",
];

export const userProperties = [
  "users.id",
  "users.username",
  "users.data",
  "users.fileCount",
  "users.slateCount",
  "users.followerCount",
];

export const fileProperties = [
  "files.id",
  "files.ownerId",
  "files.cid",
  "files.isPublic",
  "files.filename",
  "files.data",
  "files.createdAt",
  "files.likeCount",
  "files.downloadCount",
  "files.saveCount",
];
