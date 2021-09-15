import * as Conversions from "~/common/conversions";

import { uploadByUrl } from "~/node_common/api-core/upload-by-url";

export default async (req, res) => {
  let file = await uploadByUrl(req, res);
  if (!file) {
    return;
  }

  let reformattedData = Conversions.convertToV3File(file);

  return res.status(200).send({
    decorator: "V3_UPLOAD_BY_URL",
    data: reformattedData,
  });
};
