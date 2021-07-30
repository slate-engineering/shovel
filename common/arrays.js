import * as Validations from "~/common/validations";

export const filterPublic = (arr = []) => {
  return arr.filter((item) => item.isPublic);
};

export const filterPrivate = (arr = []) => {
  return arr.filter((item) => !item.isPublic);
};

export const mapToIds = (arr = []) => {
  return arr.map((item) => item.id);
};

export const mapToCids = (arr = []) => {
  return arr.map((item) => item.cid);
};

export const countPublic = (arr = []) => {
  const reducer = (count, item) => {
    if (item.isPublic) return count + 1;
    else return count;
  };
  return arr.reduce(reducer, 0);
};

export const countPrivate = (arr = []) => {
  const reducer = (count, item) => {
    if (!item.isPublic) return count + 1;
    else return count;
  };
  return arr.reduce(reducer, 0);
};

export const filterLinks = (arr = []) => {
  return arr.filter((item) => Validations.isLinkType(item.data.type));
};

export const filterFiles = (arr = []) => {
  return arr.filter((item) => !Validations.isLinkType(item.data.type));
};
