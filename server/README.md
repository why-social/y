# Server – ExpressJS Backend

This [ExpressJS](https://expressjs.com/) template provides the basic infrastructure for a JSON API with MongoDB persistency with [Mongoose](https://mongoosejs.com/).

## Server Structure

| File                                                                         | Purpose           |
| ---------------------------------------------------------------------------- | ------------- |
| `db/database.js`                                                             | [Mongoose](https://mongoosejs.com/) DB and models creation |
| `middleware/`                                                                | Express endpoint middleware |
| `routes/`                                                                    | Implementation of Express endpoints |
| [tests/server.postman_collection.json](tests/server.postman_collection.json) | Postman test scripts |
| `uploads/`                                                                   | Media uploaded to the server |
| `utils/`                                                                     | Code utilities |
| [.env_example](./.env_example)                                               | Example .env file |
| [app.js](./app.js)                                                           | JavaScript entry point for Express application |
| [package.json](package.json)                                                 | Project meta-information |

> NOTE: The (mandatory) exercises are essential for understanding this template and will *save* you time!

Optional: Learn how to create such a project template in this [tutorial](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/skeleton_website).

## Requirements

* [Node.js](https://nodejs.org/en/download/) (>=v18) Installation instructions for [Linux](https://github.com/nodesource/distributions), use installers for macOS and Windows (don't forget to restart your Bash shell)
* [MongoDB](https://www.mongodb.com/download-center/community?jmp=nav) (>=6) must be running locally on port 27017
* [Postman](https://www.getpostman.com/downloads/) (>=v8) for API testing

## Project setup

### Install dependencies
```bash
cd server
npm install
```

### .env
A .env file following the [example](./.env_example) must be created.
- ADMIN_KEY - key for admin-only actions.
- ADMIN_PASSWORD - password for admin account.
- ADMIN_EMAIL - email for admin account.
- MJ_APIKEY_PUBLIC - MailJet public API key.
- MJ_APIKEY_PRIVATE - MailJet private API key.


## Start the server with auto-restarts for development

Automatically restarts your server if you save any changes to local files.

```bash
npm run dev
```

## Start the server

```bash
npm run start
```

## Run the Postman Tests

Starts a new server on another port (default `3001`) and runs the `server` postman test collection against a test database (default `whyTestDB`).

```bash
npm run test
```

> The test database is dropped before each test execution.
