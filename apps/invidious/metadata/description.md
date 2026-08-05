Invidious is an open source alternative front-end to YouTube.

Watch, search and subscribe to channels without ads, without tracking and without a Google account. Video playback is handled by [Invidious Companion](https://github.com/iv-org/invidious-companion), a separate service that fetches the streams from YouTube server-side.

## Features

- **No ads** and no tracking scripts
- **Lightweight interface** that works without JavaScript
- **Subscriptions, playlists and watch history** stored locally in your own database
- **Audio-only mode** and configurable default quality
- **RSS feeds** for channels, playlists and searches
- **Public JSON API** compatible with third-party clients

## Configuration

The instance is ready to use after installation. Set **Domain** (and enable **HTTPS Only**) when exposing it through a reverse proxy, so generated links point to the right address. HMAC key, companion key and database password are generated automatically.

Registrations are open by default: create an account from the login page to keep subscriptions and preferences.

## Notes

- YouTube regularly changes its APIs. If playback breaks, update the app to get the latest Invidious and Companion release.
- Database tables are created automatically on first start (`check_tables`).
