# sing-box Proxy App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add sing-box as standalone Runtipi app for HTTP proxy functionality, enabling RSSHub to bypass 403 Forbidden errors.

**Architecture:** Single-service app with official ghcr.io/sagernet/sing-box image, static config mounted from data/, exposed on port 8080 (external) and 8888 (internal). RSSHub pre-configured with default PROXY_URI pointing to sing-box.

**Tech Stack:** sing-box v1.12.21, Docker, Runtipi v2 schema, Renovate

---

## Task 1: Create Base Directory Structure

**Files:**
- Create: `apps/singbox/` (directory)
- Create: `apps/singbox/data/` (directory)
- Create: `apps/singbox/metadata/` (directory)

**Step 1: Create directory structure**

```bash
mkdir -p apps/singbox/data apps/singbox/metadata
```

**Step 2: Verify structure**

Run: `ls -la apps/singbox/`
Expected: directories `data/` and `metadata/` exist

**Step 3: Commit**

```bash
git add apps/singbox/
git commit -m "feat(singbox): create base directory structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create sing-box Config Metadata (config.json)

**Files:**
- Create: `apps/singbox/config.json`

**Step 1: Create config.json with metadata**

```json
{
  "id": "singbox",
  "name": "sing-box",
  "available": true,
  "exposable": true,
  "port": 8080,
  "categories": ["utilities"],
  "description": "Universal proxy platform supporting HTTP, SOCKS5, and advanced routing",
  "short_desc": "Universal proxy platform for bypassing network restrictions",
  "author": "SagerNet",
  "source": "https://github.com/SagerNet/sing-box",
  "website": "https://sing-box.sagernet.org/",
  "version": "1.12.21",
  "tipi_version": 1,
  "supported_architectures": ["amd64", "arm64"],
  "dynamic_config": false,
  "min_tipi_version": "4.5.0",
  "form_fields": [],
  "created_at": 1739541600000,
  "updated_at": 1739541600000
}
```

**Step 2: Verify JSON is valid**

Run: `bun run scripts/validate-json.js`
Expected: `✓ apps/singbox/config.json`

**Step 3: Run tests to verify config**

Run: `bun test --test-name-pattern "singbox"`
Expected: Tests should find config.json and validate required fields

**Step 4: Commit**

```bash
git add apps/singbox/config.json
git commit -m "feat(singbox): add app metadata config

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Docker Compose Configuration

**Files:**
- Create: `apps/singbox/docker-compose.json`

**Step 1: Create docker-compose.json**

```json
{
  "$schema": "https://schemas.runtipi.io/v2/dynamic-compose.json",
  "schemaVersion": 2,
  "services": [
    {
      "name": "singbox",
      "image": "ghcr.io/sagernet/sing-box:v1.12.21",
      "isMain": true,
      "internalPort": 8888,
      "command": "run -c /etc/sing-box/config.json",
      "volumes": [
        {
          "hostPath": "${APP_DATA_DIR}/data/config.json",
          "containerPath": "/etc/sing-box/config.json"
        }
      ]
    }
  ]
}
```

**Step 2: Validate docker-compose schema**

Run: `bun run scripts/validate-json.js`
Expected: `✓ apps/singbox/docker-compose.json`

**Step 3: Run full test suite**

Run: `bun test --test-name-pattern "singbox"`
Expected: All singbox tests pass (config + docker-compose validation)

**Step 4: Commit**

```bash
git add apps/singbox/docker-compose.json
git commit -m "feat(singbox): add docker compose configuration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create sing-box Proxy Configuration

**Files:**
- Create: `apps/singbox/data/config.json`

**Step 1: Create minimal HTTP proxy config**

```json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "inbounds": [
    {
      "type": "http",
      "tag": "http-in",
      "listen": "0.0.0.0",
      "listen_port": 8888
    }
  ],
  "outbounds": [
    {
      "type": "direct",
      "tag": "direct"
    }
  ]
}
```

**Step 2: Verify JSON syntax**

Run: `cat apps/singbox/data/config.json | jq .`
Expected: Formatted JSON output (no syntax errors)

**Step 3: Commit**

```bash
git add apps/singbox/data/config.json
git commit -m "feat(singbox): add minimal HTTP proxy configuration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create App Description

**Files:**
- Create: `apps/singbox/metadata/description.md`

**Step 1: Create description.md**

```markdown
# sing-box

sing-box is a universal proxy platform that supports multiple protocols including HTTP, SOCKS5, Shadowsocks, VMess, and advanced routing capabilities.

## Default Configuration

This app comes pre-configured with a simple HTTP proxy:

- **Internal Port**: 8888 (accessible by other Tipi containers)
- **External Port**: 8080 (accessible from your network)
- **Protocol**: HTTP proxy (no authentication)

## Quick Start

After installation, the proxy is immediately available at:

- **Internal URL** (for other Tipi apps): `http://singbox:8888`
- **External URL** (from your network): `http://<your-tipi-host>:8080`

## Integration with RSSHub

sing-box works seamlessly with RSSHub to bypass 403 Forbidden errors:

1. Install sing-box from the Tipi app store
2. Install RSSHub (or if already installed, check Proxy URI setting)
3. RSSHub is pre-configured to use `http://singbox:8888`
4. Routes like `/producthunt/today` will work without 403 errors

## Advanced Configuration

For advanced use cases (chain proxy, SOCKS5, custom routing), you can edit the configuration file:

1. Navigate to your Tipi data directory: `runtipi/app-data/singbox/data/`
2. Edit `config.json` with your custom sing-box configuration
3. Restart the sing-box container

### Example: Chain Proxy

To route traffic through an upstream proxy:

```json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "inbounds": [
    {
      "type": "http",
      "tag": "http-in",
      "listen": "0.0.0.0",
      "listen_port": 8888
    }
  ],
  "outbounds": [
    {
      "type": "http",
      "tag": "upstream",
      "server": "proxy.example.com",
      "server_port": 3128
    }
  ]
}
```

### Example: SOCKS5 Support

To add SOCKS5 inbound:

```json
{
  "inbounds": [
    {
      "type": "http",
      "tag": "http-in",
      "listen": "0.0.0.0",
      "listen_port": 8888
    },
    {
      "type": "socks",
      "tag": "socks-in",
      "listen": "0.0.0.0",
      "listen_port": 1080
    }
  ],
  "outbounds": [
    {
      "type": "direct",
      "tag": "direct"
    }
  ]
}
```

## Documentation

For complete configuration reference, visit:
- [sing-box Documentation](https://sing-box.sagernet.org/)
- [Configuration Examples](https://sing-box.sagernet.org/configuration/)
- [GitHub Repository](https://github.com/SagerNet/sing-box)

## Use Cases

- **Bypass geo-restrictions**: Access region-locked content
- **Avoid rate limiting**: Rotate proxy chains for web scraping
- **Development testing**: Test apps with different network configurations
- **Privacy**: Route traffic through multiple proxy hops
```

**Step 2: Verify markdown syntax**

Run: `cat apps/singbox/metadata/description.md | head -20`
Expected: Readable markdown output

**Step 3: Commit**

```bash
git add apps/singbox/metadata/description.md
git commit -m "feat(singbox): add app description documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Add sing-box Logo

**Files:**
- Create: `apps/singbox/metadata/logo.jpg`

**Step 1: Download sing-box logo**

**Note:** Manual step required - download logo from sing-box project or create placeholder.

Option A (automated via curl):
```bash
# Download sing-box logo from GitHub (if available)
curl -L -o apps/singbox/metadata/logo.jpg "https://raw.githubusercontent.com/SagerNet/sing-box/dev-next/docs/assets/icon.png"
```

Option B (manual):
1. Visit https://github.com/SagerNet/sing-box
2. Find official logo/icon
3. Save as `apps/singbox/metadata/logo.jpg`
4. Ensure dimensions are reasonable (256x256 or similar)

**Step 2: Verify logo exists**

Run: `ls -lh apps/singbox/metadata/logo.jpg`
Expected: File exists with reasonable size (< 500KB)

**Step 3: Run tests**

Run: `bun test --test-name-pattern "singbox"`
Expected: Test passes for "should have metadata/logo.jpg"

**Step 4: Commit**

```bash
git add apps/singbox/metadata/logo.jpg
git commit -m "feat(singbox): add app logo

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create CLAUDE.md Architecture Notes

**Files:**
- Create: `apps/singbox/CLAUDE.md`

**Step 1: Create CLAUDE.md**

```markdown
# sing-box

Universal proxy platform supporting HTTP, SOCKS5, and advanced routing.

## Architecture

Single-service app with official image from SagerNet.

- **singbox** (main): Proxy server on port 8888 (internal) / 8080 (external)

## Key Details

- Config file mounted from `data/config.json` → `/etc/sing-box/config.json`
- Default: HTTP proxy on 0.0.0.0:8888 with direct outbound
- No authentication (open proxy for internal Tipi network)
- Log level "info" shows connections in real-time
- Advanced users can edit `data/config.json` for chain proxy, SOCKS5, routing rules

## Configuration

**Minimal HTTP proxy** (default):
- Inbound: HTTP on port 8888
- Outbound: Direct connection

**Common customizations**:
- Chain proxy: Change outbound to HTTP/SOCKS5 upstream
- Multi-protocol: Add SOCKS5 inbound on port 1080
- Routing: Add route rules for selective proxying
- DNS: Custom DNS servers for resolution

## Integration

**Used by RSSHub** via `PROXY_URI=http://singbox:8888` to bypass 403 errors.

Other apps can reference `http://singbox:8888` in their proxy configuration.

## Renovate

Per-app customManager in `renovate.json` tracks `ghcr.io/sagernet/sing-box` Docker image versions.
```

**Step 2: Commit**

```bash
git add apps/singbox/CLAUDE.md
git commit -m "docs(singbox): add architecture notes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Update RSSHub Integration - Config

**Files:**
- Modify: `apps/rsshub/config.json`

**Step 1: Read current PROXY_URI field**

Run: `jq '.form_fields[] | select(.env_variable=="PROXY_URI")' apps/rsshub/config.json`
Expected: Shows current PROXY_URI field

**Step 2: Update PROXY_URI field with default and improved hint**

Find the PROXY_URI field in `apps/rsshub/config.json` and update it to:

```json
{
  "type": "text",
  "label": "Proxy URI",
  "required": false,
  "env_variable": "PROXY_URI",
  "default": "http://singbox:8888",
  "hint": "Install 'sing-box' app from store for pre-configured proxy (default: http://singbox:8888), or use custom proxy URL. Leave empty to disable proxy."
}
```

**Step 3: Verify JSON syntax**

Run: `bun run scripts/validate-json.js`
Expected: `✓ apps/rsshub/config.json`

**Step 4: Increment RSSHub tipi_version**

Use @bump-tipi-version skill:
- Increment `tipi_version` by 1
- Update `updated_at` to current timestamp

**Step 5: Run tests**

Run: `bun test --test-name-pattern "rsshub"`
Expected: All rsshub tests pass

**Step 6: Commit**

```bash
git add apps/rsshub/config.json
git commit -m "feat(rsshub): add sing-box proxy integration

Update PROXY_URI default to http://singbox:8888 and improve hint
to guide users toward installing sing-box app from store.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Update RSSHub Integration - Description

**Files:**
- Modify: `apps/rsshub/metadata/description.md`

**Step 1: Read current description**

Run: `head -30 apps/rsshub/metadata/description.md`
Expected: Shows current RSSHub description

**Step 2: Add proxy configuration section**

Add this section after the main description (before any "## Features" or similar sections):

```markdown
## Proxy Configuration

To bypass 403 Forbidden errors (e.g., ProductHunt, Twitter), configure a proxy:

### Option 1: sing-box (Recommended)

Install the **sing-box** app from the Tipi store:

1. Go to Tipi App Store
2. Search for "sing-box"
3. Click Install
4. RSSHub will automatically use sing-box (pre-configured to `http://singbox:8888`)

No additional configuration needed - works out of the box!

### Option 2: Custom Proxy

If you have an existing proxy server:

1. In RSSHub settings, set **Proxy URI** to your proxy URL
2. Examples:
   - HTTP proxy: `http://proxy.example.com:8080`
   - SOCKS5 proxy: `socks5://proxy.example.com:1080`

### Option 3: Disable Proxy

Leave **Proxy URI** empty to connect directly (no proxy).
```

**Step 3: Verify markdown syntax**

Run: `grep -A 5 "Proxy Configuration" apps/rsshub/metadata/description.md`
Expected: Shows the new section

**Step 4: Increment RSSHub tipi_version (if not already done in Task 8)**

Note: If you already incremented tipi_version in Task 8, skip this step.

**Step 5: Commit**

```bash
git add apps/rsshub/metadata/description.md
git commit -m "docs(rsshub): document sing-box proxy integration

Add proxy configuration section explaining how to use sing-box
app for bypassing 403 errors with zero config.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Update Renovate Configuration

**Files:**
- Modify: `renovate.json`

**Step 1: Read current Renovate customManagers**

Run: `jq '.customManagers | length' renovate.json`
Expected: Shows count of existing custom managers

**Step 2: Add sing-box customManager**

Add this entry to the `customManagers` array in `renovate.json`:

```json
{
  "customType": "regex",
  "managerFilePatterns": ["apps/singbox/config.json"],
  "matchStrings": ["\"version\":\\s*\"(?<currentValue>[^\"]+)\""],
  "depNameTemplate": "ghcr.io/sagernet/sing-box",
  "datasourceTemplate": "docker"
}
```

Insert it alphabetically or at the end of the customManagers array, ensuring valid JSON syntax (commas).

**Step 3: Validate renovate.json syntax**

Run: `jq . renovate.json > /dev/null && echo "Valid JSON"`
Expected: "Valid JSON"

**Step 4: Test Renovate config (optional, requires renovate-test)**

Run: `make renovate-test` (if available)
Expected: No errors, sing-box detected

**Step 5: Commit**

```bash
git add renovate.json
git commit -m "chore(renovate): add sing-box version tracking

Track ghcr.io/sagernet/sing-box Docker image updates for
automatic version bumps via Renovate.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Run Full Test Suite and Validation

**Files:**
- None (validation only)

**Step 1: Run local test suite**

Run: `bun test`
Expected: All tests pass, including new singbox tests

**Step 2: Validate all JSON files**

Run: `bun run scripts/validate-json.js`
Expected: All JSON files valid, including singbox files

**Step 3: Run Docker-based CI-equivalent test**

Run: `make test`
Expected: Exit code 0, all tests pass in Docker environment

**Step 4: Check for any linting issues**

Run: `bun run lint`
Expected: No errors (or auto-fixed)

**Step 5: Verify app count**

Run: `ls -d apps/*/ | wc -l`
Expected: Count increased by 1 (singbox added)

**Step 6: Verify port uniqueness**

Run: `jq -r '.port // empty' apps/*/config.json | sort | uniq -d`
Expected: Empty output (no duplicate ports)

---

## Task 12: Final Verification and Commit Summary

**Files:**
- None (verification only)

**Step 1: Review git status**

Run: `git status`
Expected: Working tree clean (all changes committed)

**Step 2: Review commit log**

Run: `git log --oneline -10`
Expected: Shows all commits from this implementation

**Step 3: Generate commit summary**

Run: `git log --oneline --since="2 hours ago" | wc -l`
Expected: ~10 commits

**Step 4: Verify file structure**

Run: `tree apps/singbox/`
Expected:
```
apps/singbox/
├── CLAUDE.md
├── config.json
├── data
│   └── config.json
├── docker-compose.json
└── metadata
    ├── description.md
    └── logo.jpg
```

**Step 5: Final sanity check - test singbox specifically**

Run: `bun test --test-name-pattern "singbox"`
Expected: All singbox tests pass

---

## Success Criteria Verification

After all tasks complete, verify:

- ✅ `apps/singbox/` directory exists with all required files
- ✅ `config.json` has all required metadata fields
- ✅ `docker-compose.json` validates against schema v2
- ✅ Port 8080 is unique (no conflicts)
- ✅ sing-box config in `data/config.json` is valid JSON
- ✅ RSSHub `PROXY_URI` defaults to `http://singbox:8888`
- ✅ RSSHub description documents sing-box integration
- ✅ Renovate tracks `ghcr.io/sagernet/sing-box` versions
- ✅ All automated tests pass (`bun test` and `make test`)
- ✅ All files committed to git

## Post-Implementation Testing (Manual)

After merging and deploying to Tipi:

1. **Install sing-box via Tipi dashboard**
   - Verify app appears in utilities category
   - Verify installation succeeds

2. **Test proxy functionality**
   ```bash
   curl -x http://<tipi-host>:8080 http://example.com
   ```
   Expected: HTML from example.com returned

3. **Test RSSHub integration**
   - Install/update RSSHub
   - Access `http://<tipi-host>:8223/producthunt/today`
   - Expected: RSS feed (no 403 error)

4. **Test internal networking**
   ```bash
   docker exec runtipi-rsshub curl -x http://singbox:8888 http://example.com
   ```
   Expected: HTML returned via proxy

## Related Skills

- @bump-tipi-version: Use when modifying app files
- @docker-first-development: Use if running commands in Docker
- @verification-before-completion: Use before claiming tests pass

## Notes

- Logo download (Task 6) may require manual intervention if automated curl fails
- RSSHub tipi_version increment happens in Task 8 (use bump-tipi-version skill)
- Renovate testing (Task 10) is optional if `make renovate-test` is unavailable
- All commits include Co-Authored-By trailer for attribution
