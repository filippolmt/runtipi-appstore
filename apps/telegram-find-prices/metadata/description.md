## Telegram Find Prices

A Telegram bot that watches Telegram channels for product price offers and notifies allowed users. One process runs two Telegram clients: a **bot** (`BOT_TOKEN`) that you talk to, and a **user account** (`CLIENT_SESSION_STRING`) that joins and reads the channels.

It is a background worker: there is no web UI and no open port.

## Before installing

1. Create API credentials at <https://my.telegram.org> (`API_ID`, `API_HASH`).
2. Create a bot with [@BotFather](https://t.me/BotFather) (`BOT_TOKEN`).
3. Generate the user account session string on the Runtipi host (Telegram sends a login code to the phone):

   ```
   docker run --rm -it \
     -e API_ID=... -e API_HASH=... -e PHONE_NUMBER=... \
     ghcr.io/filippolmt/telegram-find-prices:latest \
     python src/generate_string_session.py
   ```

   Type the code when asked, then paste the printed `CLIENT_SESSION_STRING` value into the install form. `latest` is multi-arch (amd64, arm64).

If the session string is missing or invalid, the app logs `User session not authorized: set CLIENT_SESSION_STRING ...` and exits.

## One instance only

A user session must never run in two processes at once, and a bot token must have a single running instance. Stop any other deployment (production server, local dev) that uses the same session or bot token before starting this app. Local development should use a different bot.

## Access control

`ALLOWED_USERS` is fail-closed: if it is empty, the bot answers nobody. Find your numeric user ID with a bot such as @userinfobot.

## Data and security

`${APP_DATA_DIR}/data/bot` holds the SQLite database and the bot session file. Back it up and never share it: it contains Telegram sessions. Schema migrations run automatically at startup. `BOT_SESSION_NAME`, `CLIENT_SESSION_NAME` and `DATABASE_URL` keep the image defaults, so everything stays inside that directory.

## Checking it works

The app logs show, in order: `Bot started!`, `Client started!`, `Channel listener active!`, `Daily summary scheduler started (at HH:00 <TZ>)`. Then send `/start` to the bot from an allowed account.
