# RSSHub

RSS feed generator for 1000+ websites.

## Architecture

3-service setup: main app + Redis + headless browser.

- **rsshub** (main): Node.js app on port 1200 (exposed as 8223)
- **rsshub-redis**: Redis for feed caching (`CACHE_TYPE=redis` required)
- **rsshub-browserless**: Headless Chrome for sites requiring JavaScript rendering

## Key Details

- `CACHE_TYPE=redis` must be explicitly set, otherwise defaults to `memory` and Redis is unused
- `TZ` is a Node.js/Linux system variable (not in RSSHub's config.ts) but works at container level
- User-configurable fields via Tipi UI: timezone, access key, GitHub token, YouTube key, Telegram token, Twitter cookie, proxy URI
- Infrastructure env vars (`REDIS_URL`, `PUPPETEER_WS_ENDPOINT`, `NODE_ENV`, `CACHE_TYPE`) are hardcoded
- Uses date-based versioning (e.g., `2026-02-13`)

## Renovate

Per-app customManager in `renovate.json` tracks `diygod/rsshub` Docker image versions. Redis is disabled globally in packageRules.
