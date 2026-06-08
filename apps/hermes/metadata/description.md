## Hermes Agent

Hermes Agent is a self-hosted AI agent by **Nous Research**. It runs as a persistent gateway that connects large language models to chat platforms (Telegram, Discord, Slack, WhatsApp) and exposes an **OpenAI-compatible API server**. A built-in web dashboard lets you manage sessions, memories, skills, and configuration from the browser.

All state — config, API keys, sessions, memories, skills — lives in a single data directory mounted inside the container at `/opt/data`. The image is stateless and can be upgraded without losing configuration.

## Installation Notes

**First-run configuration is required.** Providing API keys alone is not enough — Hermes needs a model provider (and optionally a chat platform) selected in its `config.yaml`. After installing, configure the agent in one of two ways:

- Open the **web dashboard** and complete the configuration there, or
- Run the interactive setup wizard inside the container:
  ```
  docker exec -it hermes hermes setup
  ```

The API keys you enter in the install form are forwarded as environment variables and written to `/opt/data/.env`.

## Ports

- **Web dashboard** — served on the app's main URL.
- **8642** — OpenAI-compatible API server and health endpoint, exposed on the host. Point external tools or OpenAI-compatible clients here.

## Security warning

This app runs the dashboard with `HERMES_DASHBOARD_INSECURE=1`, which **disables the OAuth auth gate** so the dashboard is reachable behind the Runtipi reverse proxy. The dashboard exposes API keys and session data. **Do not expose this app to the internet** without putting your own authentication in front of it (for example, an authenticating reverse proxy). Keep it on a trusted network.

## Links

- Website: https://hermes-agent.nousresearch.com
- Docs: https://hermes-agent.nousresearch.com/docs/user-guide/docker
