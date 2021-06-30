import Redis from "ioredis";

import * as Environment from "~/node_common/environment";

const redisClient = new Redis({
  port: Environment.DOWNLOAD_REDIS_PORT,
  host: Environment.DOWNLOAD_REDIS_HOST,
  password: Environment.DOWNLOAD_REDIS_PASSWORD,
});

export default redisClient;
