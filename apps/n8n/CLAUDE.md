# n8n — App-specific notes

Complex app with 5 services in queue mode. Changes here require extra care.

## Architecture

| Service | Image | Role |
|---------|-------|------|
| `n8n` (isMain) | n8nio/n8n | Web UI + API, queue mode |
| `n8n-worker` | n8nio/n8n | Background execution worker |
| `n8n-db` | postgres | Primary data store (non-root user via init script) |
| `n8n-redis` | redis:alpine | Queue backend (Bull) |
| `n8n-worker-task-runner` | n8nio/runners | External task runner for Code nodes |

## Key constraints

- **Image sync**: `n8n`, `n8n-worker`, and `n8n-worker-task-runner` versions must stay aligned (same minor). Renovate groups them.
- **Renovate tracks GitHub Releases, not Docker tags**: the `config.json` version and both images (`n8nio/n8n`, `n8nio/runners`) resolve from `n8n-io/n8n` releases (`n8n@X.Y.Z`), so only stable releases, majors included, are proposed. Docker tags carry no channel: a beta or early-access build such as `3.1.0` looks stable to the `docker` datasource. The setup spans four `renovate.json` entries — two customManagers, a rule disabling the generic Docker lookup for these images, and the `n8n` group on packageName `n8n-io/n8n` (which is also what pulls `n8nio/runners` into the group) — so change them together. It assumes `n8nio/runners` is tagged for every n8n release.
- **Shared volume**: `n8n` and `n8n-worker` mount the same `${APP_DATA_DIR}/data/n8n` path — do not split.
- **DB init script**: `data/init-data.sh` creates the non-root user. If DB env vars change, update the script too.
- **Disabled infra updates**: postgres and redis are excluded from Renovate auto-updates — bump manually with caution.
- **Runner broker**: main n8n and worker both expose broker on `0.0.0.0` — runner connects to worker on port 5679.
