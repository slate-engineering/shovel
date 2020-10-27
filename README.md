# Shovel

A lightweight server for uploading files.

### Environment Variables

To use this with https://github.com/filecoin-project/slate you need the following environment variables.

```sh
POSTGRES_ADMIN_PASSWORD=XXX
POSTGRES_ADMIN_USERNAME=XXX
POSTGRES_HOSTNAME=XXX
POSTGRES_DATABASE=XXX
TEXTILE_HUB_KEY=XXX
TEXTILE_HUB_SECRET=XXX
TEXTILE_SLACK_WEBHOOK_KEY=XXX
JWT_SECRET=XXX
SOURCE=shovel
```

### Run the server

```sh
npm install
npm run dev
```
