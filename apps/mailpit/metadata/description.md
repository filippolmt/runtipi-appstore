# Mailpit

Mailpit captures outbound SMTP traffic and presents messages in a clean, searchable web interface, making it ideal for testing email flows during development.

## Features
- Real-time web UI on port 8025 for browsing, reading, and deleting messages
- SMTP server on port 1025 compatible with most applications and frameworks
- Persistent storage for message history via the mounted data volume
- Configurable message retention limits to match your project needs

## Getting Started
1. Deploy the app and point your application SMTP settings to the exposed SMTP port (default 1025).
2. Open the Mailpit web UI on the main port (default 8025) to view captured messages.
3. Adjust the optional `MP_MAX_MESSAGES` limit if you need Mailpit to retain more or fewer messages.

For additional configuration options and API usage, visit the [Mailpit documentation](https://github.com/axllent/mailpit).
