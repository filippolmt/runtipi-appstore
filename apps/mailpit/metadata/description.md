# Mailpit

Mailpit is a lightweight email testing tool with a modern web UI, message search, and SMTP server for catching emails during development.

## Features
- Web inbox on port 8025 with search and message inspection
- SMTP server on port 1025 for local test deliveries
- Configurable message limits and auth flags
- Persistent storage for messages and settings

## Tips
- Point your app's SMTP host to `mailpit` (inside the Tipi network) or your host IP on port `1025`.
- Keep the UI exposed on port `8025` if you want to open the inbox from your browser.
