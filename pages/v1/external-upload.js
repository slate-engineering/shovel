import * as Conversions from "~/common/conversions";

import { upload } from "~/node_common/api-core/upload";

export default async (req, res) => {
  let response = await upload(req, res);
  if (!response) {
    return;
  }
  const { file } = response;

  let reformattedData = Conversions.convertToV1File(file);

  return res.status(200).send({
    decorator: "V1_UPLOAD",
    data: reformattedData,
  });
};
