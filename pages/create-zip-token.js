import { v4 } from "uuid";
import Redis from "ioredis";
import * as Environment from "~/node_common/environment";

const redisClient = new Redis({
  port: Environment.DOWNLOAD_REDIS_PORT,
  host: Environment.DOWNLOAD_REDIS_HOST,
  password: Environment.DOWNLOAD_REDIS_PASSWORD,
});

export default async (req, res) => {
  if (!(req.body?.files && req.body?.files.length > 0)) {
    return res.status(500).send({ decorator: "SERVER_CREATE_ZIP_TOKEN_INVALID_INPUT" });
  }

  const token = v4();
  const files = req.body.files;

  await redisClient.set(token, JSON.stringify(files), "EX", 10 * 60);

  res.status(200).json({
    decorator: "SERVER_CREATE_ZIP_TOKEN_SUCCESS",
    data: { token },
  });
};
