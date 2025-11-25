# Puter

Puter is a self-hosted cloud computer that delivers a desktop-like experience in the browser.

## Features
- Web UI on port 4100 with file manager, sharing, and apps
- Persistent config and data volumes
- PUID/PGID controls for filesystem ownership
- Health-checked service for reliable startup

## Quick start
- Point your browser to the exposed port 4100 to access the Puter interface.
- Map your desired user/group IDs via PUID/PGID if you need specific file ownership on the host.
- Config files live in `/etc/puter`, user data in `/var/puter`.
