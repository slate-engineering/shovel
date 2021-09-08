import * as Conversions from "~/common/conversions";

import { uploadByCid } from "~/node_common/api-core/upload-by-cid";

export default async (req, res) => {
  let response = await uploadByCid(req, res);
  if (!response) {
    return;
  }
  const { file } = response;

  let reformattedData = Conversions.convertToV2File(file);

  return res.status(200).send({
    decorator: "V2_UPLOAD_BY_CID",
    data: reformattedData,
  });
};
