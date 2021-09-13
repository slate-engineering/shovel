import * as Environment from "~/node_common/environment";
import * as Strings from "~/common/strings";
import * as Constants from "~/node_common/constants";
import * as Data from "~/node_common/data";
import * as Social from "~/node_common/social";
import * as Logging from "~/common/logging";
import * as ArrayUtilities from "~/node_common/array-utilities";
import * as Monitor from "~/node_common/monitor";
import * as Arrays from "~/common/arrays";
import * as SearchManager from "~/node_common/managers/search";
import * as ScriptLogging from "~/node_common/script-logging";

import crypto from "crypto";
import JWT from "jsonwebtoken";

const SHOVEL = "SHOVEL          ";
const ENCRYPTION_ALGORITHM = "aes-256-ctr";
const ENCRYPTION_IV = crypto.randomBytes(16);

import { Buckets, PrivateKey, Filecoin, Client, ThreadID } from "@textile/hub";

const BUCKET_NAME = "data";

const TEXTILE_KEY_INFO = {
  key: Environment.TEXTILE_HUB_KEY,
  secret: Environment.TEXTILE_HUB_SECRET,
};

export const decodeCookieToken = (token) => {
  try {
    const decoded = JWT.verify(token, Environment.JWT_SECRET);
    return decoded.id;
  } catch (e) {
    ScriptLogging.error(SHOVEL, e.message);
    return null;
  }
};

export const checkTextile = async () => {
  try {
    const response = await fetch("https://slate.textile.io/health", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status === 204) {
      return true;
    }

    Social.sendTextileSlackMessage({
      file: "/node_common/utilities.js",
      user: { username: "UNDEFINED" },
      message: "https://slate.textile.io/health is down",
      code: "N/A",
      functionName: `checkTextile`,
    });
  } catch (e) {
    Social.sendTextileSlackMessage({
      file: "/node_common/utilities.js",
      user: { username: "UNDEFINED" },
      message: e.message,
      code: e.code,
      functionName: `checkTextile`,
    });
  }

  return false;
};

export const encryptWithSecret = async (text, secret) => {
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, secret, ENCRYPTION_IV);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: ENCRYPTION_IV.toString("hex"),
    hex: encrypted.toString("hex"),
  };
};

export const parseAuthHeader = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  var matches = value.match(/(\S+)\s+(\S+)/);
  return matches && { scheme: matches[1], value: matches[2] };
};

export const getFilecoinAPIFromUserToken = async ({ user }) => {
  const token = user.textileToken;
  const identity = await PrivateKey.fromString(token);
  const filecoin = await Filecoin.withKeyInfo(TEXTILE_KEY_INFO);
  await filecoin.getToken(identity);

  Logging.log(`filecoin init`);

  return {
    filecoin,
  };
};

export const setupWithThread = async ({ buckets }) => {
  const client = new Client(buckets.context);

  try {
    const res = await client.getThread("buckets");

    buckets.withThread(res.id.toString());
  } catch (error) {
    if (error.message !== "Thread not found") {
      throw new Error(error.message);
    }

    const newId = ThreadID.fromRandom();
    await client.newDB(newId, "buckets");
    const threadID = newId.toString();

    buckets.withThread(threadID);
  }

  return buckets;
};

export const addExistingCIDToData = async ({ buckets, key, path, cid }) => {
  try {
    await buckets.setPath(key, path || "/", cid);
    return true;
  } catch (e) {
    return false;
  }
};

// NOTE(jim): Requires @textile/hub
export const getBucketAPIFromUserToken = async ({ user, bucketName, encrypted = false }) => {
  const token = user.textileToken;
  const name = Strings.isEmpty(bucketName) ? BUCKET_NAME : bucketName;
  const identity = await PrivateKey.fromString(token);
  let buckets = await Buckets.withKeyInfo(TEXTILE_KEY_INFO);

  await buckets.getToken(identity);

  let root = null;
  Logging.log(`buckets.getOrCreate() init ${name}`);
  try {
    Logging.log("before buckets get or create");
    const created = await buckets.getOrCreate(name, { encrypted });
    Logging.log("after buckets get or create");
    root = created.root;
  } catch (e) {
    Logging.log(`buckets.getOrCreate() warning: ${e.message}`);
    Social.sendTextileSlackMessage({
      file: "/node_common/utilities.js",
      user,
      message: e.message,
      code: e.code,
      functionName: `buckets.getOrCreate`,
    });
  }

  if (!root) {
    Logging.error(`buckets.getOrCreate() failed for ${name}`);
    return { buckets: null, bucketKey: null, bucketRoot: null };
  }

  Logging.log(`buckets.getOrCreate() success for ${name}`);
  return {
    buckets,
    bucketKey: root.key,
    bucketRoot: root,
    bucketName: name,
  };
};

export const getFileName = (s) => {
  let target = s;
  if (target.endsWith("/")) {
    target = target.substring(0, target.length - 1);
  }

  return target.substr(target.lastIndexOf("/") + 1);
};

export const createFolder = ({ id, name }) => {
  return {
    decorator: "FOLDER",
    id,
    folderId: id,
    icon: "FOLDER",
    name: name ? name : getFileName(id),
    pageTitle: `Exploring ${getFileName(id)}`,
    date: null,
    size: null,
    children: [],
  };
};

export const updateStateData = async (state, newState) => {
  return {
    ...state,
    ...newState,
  };
};

export const generateRandomNumberInRange = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

// NOTE(daniel): get all tags on slates and files
export const getUserTags = ({ library }) => {
  let tags = new Set();

  const isNotEmptyArray = (arr) => Array.isArray(arr) && arr?.length > 0;

  library.forEach((item) => {
    if (isNotEmptyArray(item.tags)) {
      for (let tag of item.tags) {
        tags.add(tag);
      }
    }
  });

  return Array.from(tags);
};

export const addToSlate = async ({ slate, files, user, saveCopy = false }) => {
  let { filteredFiles } = await ArrayUtilities.removeDuplicateSlateFiles({
    files,
    slate,
  });

  if (!filteredFiles.length) {
    return { added: 0 };
  }

  let response = await Data.createSlateFiles({ owner: user, slate, files: filteredFiles });
  if (!response || response.error) {
    return {
      decorator: saveCopy
        ? "SERVER_SAVE_COPY_ADD_TO_SLATE_FAILED"
        : "SERVER_CREATE_FILE_ADD_TO_SLATE_FAILED",
      added: 0,
    };
  }

  if (saveCopy) {
    Monitor.saveCopy({ user, slate, files: filteredFiles });
  } else {
    Monitor.upload({ user, slate, files: filteredFiles });
  }

  await Data.updateSlateById({ id: slate.id, updatedAt: new Date() });

  if (slate.isPublic) {
    addToPublicCollectionUpdatePrivacy({ filteredFiles });
  }

  return { added: response.length };
};

export const removeFromPublicCollectionUpdatePrivacy = async ({ files }) => {
  let targetFiles = Arrays.filterPublic(files);
  let madePrivate = [];
  for (let file of targetFiles) {
    let updatedFile = await Data.recalcFilePrivacy({ fileId: file.id });
    if (!updatedFile) continue;
    if (file.isPublic && !updatedFile.isPublic) {
      madePrivate.push(updatedFile);
    }
  }
  if (madePrivate.length) {
    SearchManager.updateFile(madePrivate, "REMOVE");
  }
  return madePrivate;
};

export const addToPublicCollectionUpdatePrivacy = async ({ files }) => {
  let targetFiles = Arrays.filterPrivate(files);
  let madePublic = [];
  for (let file of targetFiles) {
    let updatedFile = await Data.recalcFilePrivacy({ fileId: file.id });
    if (!updatedFile) continue;
    if (!file.isPublic && updatedFile.isPublic) {
      madePublic.push(updatedFile);
    }
  }
  if (madePublic.length) {
    SearchManager.updateFile(madePublic, "ADD");
  }
  return madePublic;
};
