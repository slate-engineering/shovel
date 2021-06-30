import { v4 } from "uuid";

import redisClient from "~/node_common/redis";

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
