---
name: review-major-update
description: Use when reviewing a Renovate major-version PR or deciding whether an app upgrade is safe to merge.
---

# Review a major update

Done when you can state: merge yes/no, what breaks for existing installs, and the rollback path.

1. **Channel**: is the new version a stable upstream release? Check the GitHub/Codeberg release `prerelease` flag and any warning in the release body; a clean semver Docker tag proves nothing.
2. **Breaking changes**: read the official upgrade/breaking-changes page (try `<docs>/sitemap.md` or `llms.txt` to find it), plus notes of every patch up to the target. Map each item to this app's `docker-compose.json` env, volumes, commands.
3. **Data migrations**: diff the migrations directory between the two tags (`gh api repos/<o>/<r>/git/trees/<tag>?recursive=1`). New migrations mean no downgrade: rollback = backup restore.
4. **Images**: target tags exist for every `supported_architectures` entry (`docker manifest inspect`).
5. **Sidecars**: commands the compose runs inside the image (CLI subcommands, runners) still exist — `docker run --rm --entrypoint <bin> <image> <cmd> --help`.
6. **Mechanics**: `make test`, `updated_at` not in the future, CI green.

Report the verdict first, then the risks, then what you could not verify.
