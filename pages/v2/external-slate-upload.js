import * as Conversions from "~/common/conversions";

import { slateUpload } from "~/node_common/api-core/slate-upload";

export default async (req, res) => {
  let response = await slateUpload(req, res);
  if (!response) {
    return;
  }
  const { file, slate } = response;

  const reformattedData = Conversions.convertToV2File(file);

  const reformattedSlate = Conversions.convertToV2Slate(slate);

  return res.status(200).send({
    decorator: "V2_UPLOAD_TO_SLATE",
    data: reformattedData,
    slate: reformattedSlate,
  });
};
