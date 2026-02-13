# Workout Cool

Fitness coaching platform for workout plans, progress tracking, and exercise database.

## Architecture

2-service setup: main app + PostgreSQL.

- **workout-cool** (main): Next.js app on port 3000
- **workout-cool-db**: PostgreSQL 16 for data storage

## Key Details

- Database dependency uses `condition: "service_healthy"` with `pg_isready` health check
- 2 auto-generated secrets: auth secret (min 32) and DB password (min 24)
- Optional Google OAuth integration (disabled by default with `"disabled"` placeholder)
- Optional sample data seeding on first start

## Renovate

Per-app customManager in `renovate.json` tracks `ghcr.io/snouzy/workout-cool` Docker image versions.
