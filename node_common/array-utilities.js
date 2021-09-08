import * as Data from "~/node_common/data";

//NOTE(martina): removes any files whose cids are already owned by the user
export const removeDuplicateUserFiles = async ({ files, user }) => {
  const duplicateFiles = await Data.getFilesByCids({
    ownerId: user.id,
    cids: files.map((file) => file.cid),
  });

  const duplicateCids = duplicateFiles.map((file) => file.cid);

  const filteredFiles = files.filter((file) => !duplicateCids.includes(file.cid));

  return { duplicateFiles, filteredFiles };
};

//NOTE(martina): removes any files whose cids are already in the slate
export const removeDuplicateSlateFiles = async ({ files, slate }) => {
  let duplicateFiles = await Data.getSlateFilesByCids({
    slateId: slate.id,
    cids: files.map((file) => file.cid),
  });

  const duplicateCids = duplicateFiles.map((file) => file.cid);

  const filteredFiles = files.filter((file) => !duplicateCids.includes(file.cid));

  return { duplicateFiles, filteredFiles };
};
