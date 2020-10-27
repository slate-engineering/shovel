import * as Environment from "~/node_common/environment";
import * as Constants from "~/node_common/constants";
import * as Social from "~/node_common/social";
import * as ScriptLogging from "~/node_common/script-logging";
import * as Strings from "~/common/strings";

import JWT from "jsonwebtoken";

import { Buckets, PrivateKey, Pow, Client, ThreadID } from "@textile/hub";

const BUCKET_NAME = "data";

const INIT = "INIT BUCKETS    ";

const TEXTILE_KEY_INFO = {
  key: Environment.TEXTILE_HUB_KEY,
  secret: Environment.TEXTILE_HUB_SECRET,
};

export const decodeCookieToken = (token) => {
  try {
    const decoded = JWT.verify(token, Environment.JWT_SECRET);
    return decoded.id;
  } catch (e) {
    ScriptLogging.error("SHOVEL          ", e.message);
    return null;
  }
};

export const parseAuthHeader = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  var matches = value.match(/(\S+)\s+(\S+)/);
  return matches && { scheme: matches[1], value: matches[2] };
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

export const getBucketAPIFromUserToken = async ({ user, bucketName, encrypted = false }) => {
  const token = user.data.tokens.api;
  const name = Strings.isEmpty(bucketName) ? BUCKET_NAME : bucketName;
  const identity = await PrivateKey.fromString(token);
  let buckets = await Buckets.withKeyInfo(TEXTILE_KEY_INFO);

  await buckets.getToken(identity);

  let root = null;

  ScriptLogging.message(INIT, `getOrCreate init ${name}`);

  // NOTE(jim): captures `withThread` cases.
  try {
    buckets = await setupWithThread({ buckets });
  } catch (e) {
    ScriptLogging.error(INIT, `warning: ${e.message}`);
  }

  ScriptLogging.message(INIT, `getOrCreate thread found for ${name}`);

  // NOTE(jim): captures finding your bucket and or creating a new one.
  try {
    const roots = await buckets.list();
    root = roots.find((bucket) => bucket.name === name);
    if (!root) {
      ScriptLogging.message(INIT, `creating new bucket ${name}`);

      if (encrypted) {
        ScriptLogging.message(INIT, `this bucket will be encrypted`);
      }

      const created = await buckets.create(name, encrypted);
      root = created.root;
    }
  } catch (e) {
    Social.sendTextileSlackMessage({
      file: "/node_common/utilities.js",
      user,
      message: e.message,
      code: e.code,
      functionName: `buckets.getOrCreate`,
    });

    return { buckets: null, bucketKey: null, bucketRoot: null };
  }

  ScriptLogging.message(INIT, `getOrCreate success for ${name}`);

  return {
    buckets,
    bucketKey: root.key,
    bucketRoot: root,
    bucketName: name,
  };
};
