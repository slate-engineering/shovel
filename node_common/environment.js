export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PRODUCTION = NODE_ENV === "production";
export const PORT = process.env.PORT || 4242;
export const SOURCE = process.env.SOURCE;

// NOTE(jim):
// In production we don't use .env and manage secrets another way.
if (!IS_PRODUCTION) {
  require("dotenv").config();
}

export const POSTGRES_ADMIN_PASSWORD = process.env.POSTGRES_ADMIN_PASSWORD;
export const POSTGRES_ADMIN_USERNAME = process.env.POSTGRES_ADMIN_USERNAME;
export const POSTGRES_HOSTNAME = process.env.POSTGRES_HOSTNAME;
export const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE;
export const JWT_SECRET = process.env.JWT_SECRET;
export const TEXTILE_HUB_KEY = process.env.TEXTILE_HUB_KEY;
export const TEXTILE_HUB_SECRET = process.env.TEXTILE_HUB_SECRET;
export const TEXTILE_SLACK_WEBHOOK_KEY = process.env.TEXTILE_SLACK_WEBHOOK_KEY;
export const DOWNLOAD_REDIS_HOST = process.env.DOWNLOAD_REDIS_HOST;
export const DOWNLOAD_REDIS_PASSWORD = process.env.DOWNLOAD_REDIS_PASSWORD;
export const DOWNLOAD_REDIS_PORT = +process.env.DOWNLOAD_REDIS_PORT;
export const URI_SLATE = process.env.URI_SLATE;
