## Tasterr

Tasterr is a self-hosted, Netflix-style discovery interface for a household media stack. It combines the TMDB catalog with Seerr identity, library status, and requests, while learning a separate taste profile for every signed-in user.

## Requirements

Before installing Tasterr, you need:

- an existing Seerr instance;
- a TMDB v3 API key;
- a Seerr API key from **Seerr > Settings > General**.

Tasterr does not include Seerr and does not start or control media playback.

## Configuration

- **Seerr Internal URL** must be reachable from inside the Tasterr container. Use a routable LAN hostname or IP address, such as `http://192.168.1.10:5055`. Do not use `localhost` for a Seerr instance running outside this container.
- **Seerr External URL** is the URL household browsers use to access Seerr, such as `https://requests.example.com`.
- Keep the generated **Tasterr Secret Key** unchanged. Rotating it makes stored Plex tokens unreadable and requires affected users to sign in again.

After installation, sign in using an existing Seerr account. Seerr administrators can configure the region, streaming services, discovery rails, theme, and accent from Tasterr's Settings screen.

## Data and Backups

Tasterr stores its SQLite database in the Runtipi app data directory. Back up this directory before upgrades because it contains identities, taste signals, session data, and household viewing information.

## Links

- [Source code](https://github.com/ZacharyArthur/tasterr)
- [Configuration documentation](https://github.com/ZacharyArthur/tasterr/blob/main/docs/CONFIGURATION.md)
- [TMDB API settings](https://www.themoviedb.org/settings/api)
