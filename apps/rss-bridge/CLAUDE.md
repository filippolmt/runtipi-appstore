# RSS-Bridge

PHP app that generates RSS feeds for websites that don't have one.

## Architecture

Single service, no database.

- **rss-bridge** (main): PHP/nginx on port 80 (exposed as 3001)
- Volume `/config` for persistent configuration (`config.ini.php`, custom bridges)

## Key Details

- Uses `version: "latest"` with digest pinning (`@sha256:...`) since Docker Hub has no versioned tags
- No environment variables needed - configuration via `config.ini.php` in mounted volume
- Supports 400+ bridges (YouTube, Twitter, Reddit, Instagram, etc.)

## Renovate

No per-app customManager (version is `latest`). Digest pinning enabled via `pinDigests: true` packageRule for `rssbridge/rss-bridge`. The general docker-compose.json regex captures the digest separately: `(?<currentValue>[^@"]+)(?:@(?<currentDigest>[^"]+))?`.
