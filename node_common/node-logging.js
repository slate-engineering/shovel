const getTimestamp = () => {
  return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
};

const getTime = () => {
  return `[ \x1b[35m\x1b[5m${getTimestamp()}\x1b[0m ]`;
};

const SLATE = "SLATE           ";

export const error = (message) => {
  console.error(`\x1b[1m[ \x1b[31m${SLATE}\x1b[0m\x1b[1m ]\x1b[0m ${getTime()} ${message}`);
};

export const log = (message) => {
  console.info(`\x1b[1m[ \x1b[32m${SLATE}\x1b[0m\x1b[1m ]\x1b[0m ${getTime()} ${message}`);
};
