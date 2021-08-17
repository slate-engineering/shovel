# Shovel

Data transfer micro-service

### Environment Variables

To use this with https://github.com/filecoin-project/slate you need the following environment variables. Use your current development `.env` variables.

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
NODE_ENV=development
NEXT_PUBLIC_URI_SLATE=http://localhost:1337
```

### Run the server

```sh
npm install
npm run dev
```
