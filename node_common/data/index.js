// NOTE(jim):
// User postgres queries
import createUser from "~/node_common/data/methods/create-user";
import updateUserById from "~/node_common/data/methods/update-user-by-id";
import deleteUserById from "~/node_common/data/methods/delete-user-by-id";
import getUserByUsername from "~/node_common/data/methods/get-user-by-username";
import getUserById from "~/node_common/data/methods/get-user-by-id";

//NOTE(martina):
// File postgres queries
import createFile from "~/node_common/data/methods/create-file";
import getFileByCid from "~/node_common/data/methods/get-file-by-cid";
import getFilesByCids from "~/node_common/data/methods/get-files-by-cids";
import getFileById from "~/node_common/data/methods/get-file-by-id";
import getFilesByIds from "~/node_common/data/methods/get-files-by-ids";
import getFilesByUserId from "~/node_common/data/methods/get-files-by-user-id";
import deleteFilesByIds from "~/node_common/data/methods/delete-files-by-ids";
import deleteFilesByUserId from "~/node_common/data/methods/delete-files-by-user-id";
import updateFileById from "~/node_common/data/methods/update-file-by-id";
import updateFilePrivacy from "~/node_common/data/methods/update-file-privacy";

//NOTE(martina):
// Slate file postgres queries
import createSlateFiles from "~/node_common/data/methods/create-slate-files";
import deleteSlateFiles from "~/node_common/data/methods/delete-slate-files";
import getSlateFilesByCids from "~/node_common/data/methods/get-slate-files-by-cids";

// NOTE(jim):
// Slate postgres queries
import createSlate from "~/node_common/data/methods/create-slate";
import getSlateByName from "~/node_common/data/methods/get-slate-by-name";
import getSlateById from "~/node_common/data/methods/get-slate-by-id";
import getSlatesByUserId from "~/node_common/data/methods/get-slates-by-user-id";
import getSlatesByIds from "~/node_common/data/methods/get-slates-by-ids";
import updateSlateById from "~/node_common/data/methods/update-slate-by-id";
import updateSlatePrivacy from "~/node_common/data/methods/update-slate-privacy";
import deleteSlatesByUserId from "~/node_common/data/methods/delete-slates-by-user-id";
import deleteSlateById from "~/node_common/data/methods/delete-slate-by-id";

// NOTE(jim):
// API postgres queries
import createAPIKey from "~/node_common/data/methods/create-api-key";
import deleteAPIKeyById from "~/node_common/data/methods/delete-api-key-by-id";
import getAPIKey from "~/node_common/data/methods/get-api-key";
import getAPIKeyByKey from "~/node_common/data/methods/get-api-key-by-key";
import getAPIKeysByUserId from "~/node_common/data/methods/get-api-keys-by-user-id";

// NOTE(jim):
// Subscription postgres queries
import createSubscription from "~/node_common/data/methods/create-subscription";
import getSubscription from "~/node_common/data/methods/get-subscription";
import getSubscribersBySlateId from "~/node_common/data/methods/get-subscribers-by-slate-id";
import getSubscriptionsByUserId from "~/node_common/data/methods/get-subscriptions-by-user-id";
import getFollowersByUserId from "~/node_common/data/methods/get-followers-by-user-id";
import getFollowingByUserId from "~/node_common/data/methods/get-following-by-user-id";
import deleteSubscriptionById from "~/node_common/data/methods/delete-subscription-by-id";

// NOTE(jim):
// Activity postgres queries
import createActivity from "~/node_common/data/methods/create-activity";
import getActivity from "~/node_common/data/methods/get-activity";
import getExplore from "~/node_common/data/methods/get-explore";

// NOTE(jim):
// Search postgres queries
import getEverySlate from "~/node_common/data/methods/get-every-slate";
import getEveryUser from "~/node_common/data/methods/get-every-user";
import getEveryFile from "~/node_common/data/methods/get-every-file";

// NOTE(jim):
// one-offs
import createOrphan from "~/node_common/data/methods/create-orphan";

export {
  // NOTE(jim): One-offs
  createOrphan,
  // NOTE(jim): User operations
  createUser,
  updateUserById,
  deleteUserById,
  getUserByUsername,
  getUserById,
  //NOTE(martina): File operations
  createFile,
  getFileByCid,
  getFilesByCids,
  getFileById,
  getFilesByIds,
  getFilesByUserId,
  deleteFilesByIds,
  deleteFilesByUserId,
  updateFileById,
  updateFilePrivacy,
  //NOTE(martina): Slate file operations
  createSlateFiles,
  deleteSlateFiles,
  getSlateFilesByCids,
  // NOTE(jim): Slate operations
  createSlate,
  getSlateByName,
  getSlateById,
  getSlatesByUserId,
  getSlatesByIds,
  updateSlateById,
  updateSlatePrivacy,
  deleteSlatesByUserId,
  deleteSlateById,
  // NOTE(jim): API key operations
  createAPIKey,
  deleteAPIKeyById,
  getAPIKey,
  getAPIKeyByKey,
  getAPIKeysByUserId,
  // NOTE(jim): Subscription operations
  createSubscription,
  getSubscription,
  getSubscribersBySlateId,
  getSubscriptionsByUserId,
  getFollowersByUserId,
  getFollowingByUserId,
  deleteSubscriptionById,
  // NOTE(jim): Activity operations
  createActivity,
  getActivity,
  getExplore,
  // NOTE(jim): Search
  getEverySlate,
  getEveryUser,
  getEveryFile,
};
