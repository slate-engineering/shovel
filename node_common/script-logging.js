const getTimestamp = () => {
  return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
};

const getTime = () => {
  return `[ \x1b[35m\x1b[5m${getTimestamp()}\x1b[0m ]`;
};

export const error = (name, message) => {
  console.error(`\x1b[1m[ \x1b[31m${name}\x1b[0m\x1b[1m ]\x1b[0m ${getTime()} ${message}`);
};

export const message = (name, message) => {
  console.log(`\x1b[1m[ \x1b[32m${name}\x1b[0m\x1b[1m ]\x1b[0m ${getTime()} ${message}`);
};

export const progress = (name, message) => {
  console.info(`\x1b[1m[ \x1b[36m${name}\x1b[0m\x1b[1m ]\x1b[0m ${getTime()} ${message}`);
};

export const log = (name = "SCRIPT", message) => {
  console.info(`\x1b[1m[ \x1b[32m${name}\x1b[0m\x1b[1m ]\x1b[0m ${message}`);
};
