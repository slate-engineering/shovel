import { v4 as uuid } from "uuid";

export const createLocalDataIncomplete = ({ type, size, name }, id = null) => {
  return {
    id: !id ? uuid() : id,
    filename: name,
    createdAt: new Date(),
    data: {
      name: name,
      type: type,
      size: size,
    },
  };
};

export const addData = ({ user, files }) => {
  const { library } = user.data;

  // TODO(jim): Since we don't support bucket organization... yet.
  // Add just pushes to the first set. But we can change this easily later.
  let noRepeats = [...files];

  for (let i = 0; i < library.length; i++) {
    let cids = library[i].children.map((file) => file.ipfs);
    for (let j = 0; j < files.length; j++) {
      if (cids.includes(files[j].ipfs)) {
        noRepeats[j] = null;
      }
    }
  }

  noRepeats = noRepeats.filter((file) => {
    return !!file;
  });

  for (let i = 0; i < library.length; i++) {
    library[i].children = [...noRepeats, ...library[i].children];
    break;
  }

  return {
    updatedUserDataFields: { ...user.data, library },
    added: noRepeats.length,
    skipped: files.length - noRepeats.length,
  };
};
