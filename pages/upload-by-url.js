import { uploadByUrl } from "~/node_common/api-core/upload-by-url";

export default async (req, res, options) => {
  let response = await uploadByUrl(req, res, true);
  if (!response) {
    return;
  }
  const { file } = response;

  return res.status(200).json({
    decorator: "SERVER_UPLOAD_BY_URL",
    data: {
      data: file,
      owner_user_id: user.id,
    },
  });
};
