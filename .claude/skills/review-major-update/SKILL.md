---
name: review-major-update
description: Use when reviewing a Renovate major-version PR or deciding whether an app upgrade is safe to merge.
---

# Review a major update

Done when you can state: merge yes/no, what breaks for existing installs, and the rollback path.

1. **Channel**: check the GitHub/Codeberg release `prerelease` flag and any warning in the release body; a clean semver Docker tag proves nothing. Done when the target is confirmed a stable release, or the verdict is "wait".
2. **Breaking changes**: read the official upgrade/breaking-changes page (try `<docs>/sitemap.md` or `llms.txt` to find it), plus notes of every patch up to the target. Done when every listed change is marked as affecting or not affecting this app's `docker-compose.json` env, volumes and commands.
3. **Data migrations**: diff the migrations directory between the two tags (`gh api repos/<o>/<r>/git/trees/<tag>?recursive=1`). Done when you know whether a downgrade is possible; new migrations mean rollback = backup restore.
4. **Images**: `docker manifest inspect` the target tags. Done when every `supported_architectures` entry has an image.
5. **Sidecars**: run each command the compose executes inside the image with `--help` (`docker run --rm --entrypoint <bin> <image> <cmd> --help`). Done when each one still exists with the flags the compose passes.
6. **Mechanics**: run `/verify` and check the PR's CI. Done when both are green.

Report the verdict first, then the risks, then what you could not verify.
