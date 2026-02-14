# sing-box Proxy App Design

**Date:** 2026-02-14
**Author:** Claude Code
**Status:** Approved

## Overview

Add sing-box as a standalone Runtipi app to provide HTTP proxy functionality for bypassing network restrictions (403 Forbidden errors). Primary use case: RSSHub integration for sites like ProductHunt that block automated requests.

## Requirements

- Official Docker image only (ghcr.io/sagernet/sing-box)
- Standalone app visible in Tipi dashboard
- Pre-configured HTTP proxy with minimal setup
- RSSHub integration with automatic discovery
- Extensible config for advanced users

## Architecture

### Directory Structure

```
apps/singbox/
├── config.json           # Runtipi app metadata
├── docker-compose.json   # Container definition
├── data/
│   └── config.json      # sing-box config (HTTP proxy minimal)
├── metadata/
│   ├── logo.jpg         # sing-box logo
│   └── description.md   # App description + config guide
└── CLAUDE.md            # Architecture notes
```

### Service Configuration

**Single-service app:**
- Service name: `singbox` (main service, `isMain: true`)
- Image: `ghcr.io/sagernet/sing-box:v1.12.21` (latest stable)
- Internal port: `8888` (HTTP proxy)
- Exposed port: `8080` (customizable via config.json)
- No dependencies (standalone)
- Volume: mount `data/config.json` → `/etc/sing-box/config.json`

**Network accessibility:**
- External: `http://<tipi-host>:8080` (public via configured port)
- Internal: `http://singbox:8888` (other Tipi containers)

## Configuration

### sing-box Config File

**File:** `apps/singbox/data/config.json`

Minimal HTTP proxy configuration:

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

**Key parameters:**
- `log.level`: "info" (debug/info/warn/error)
- `inbounds`: HTTP proxy on 0.0.0.0:8888 (all interfaces)
- `outbounds`: "direct" (direct connection, no upstream)

### Advanced Configuration

Users can edit `data/config.json` manually for:
- Chain proxy (upstream proxy configuration)
- SOCKS5 support
- Custom routing rules
- DNS configuration

**Example chain proxy:**
```json
"outbounds": [
  {
    "type": "http",
    "tag": "upstream",
    "server": "proxy.example.com",
    "server_port": 3128
  }
]
```

## RSSHub Integration

### Changes to `apps/rsshub/config.json`

Update PROXY_URI field:

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

### Changes to `apps/rsshub/metadata/description.md`

Add proxy configuration section:

```markdown
## Proxy Configuration

To bypass 403 Forbidden errors (e.g., ProductHunt, Twitter), use a proxy:

1. **Recommended**: Install the **sing-box** app from the Tipi store
   - Pre-configured HTTP proxy
   - Works out-of-the-box with default settings
   - No manual configuration needed

2. **Alternative**: Use external proxy by setting custom PROXY_URI
```

### User Flow

1. Install RSSHub → PROXY_URI defaults to `http://singbox:8888`
2. RSSHub attempts connection to sing-box (fails gracefully if not installed)
3. User installs sing-box → RSSHub finds proxy automatically
4. 403 bypass working

## Metadata

### App Metadata (`apps/singbox/config.json`)

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
  "form_fields": []
}
```

**Key decisions:**
- `categories: ["utilities"]` - sing-box is a utility tool
- `exposable: true` - port 8080 publicly accessible
- `dynamic_config: false` - static config in data/
- `form_fields: []` - no form fields (config via file edit)

### Description Content

`metadata/description.md` includes:
- What is sing-box (universal proxy platform)
- Default configuration (HTTP proxy on port 8888)
- How to use with RSSHub
- Advanced configuration guide (edit data/config.json)
- Examples: chain proxy, SOCKS5, routing rules

## Testing

### Automated Tests

Run: `bun test --test-name-pattern "singbox"`

Validates:
- ✅ Required files exist (config.json, docker-compose.json, logo, description)
- ✅ config.json has mandatory fields
- ✅ docker-compose.json valid against schema v2
- ✅ Port 8080 unique (no conflicts)
- ✅ Timestamps valid

### Manual Functional Tests

**1. sing-box standalone:**
```bash
curl -x http://localhost:8080 http://example.com
# Should return HTML from example.com
```

**2. RSSHub integration:**
```bash
curl http://localhost:8223/producthunt/today
# Should return RSS feed (no 403 error)
```

**3. Chain proxy (advanced):**
- Edit `data/config.json` with upstream proxy
- Restart sing-box container
- Verify connection routes through upstream

### Configuration Verification

- Log level "info" shows connections in real-time
- Port 8888 accessible internally (via docker exec)
- Port 8080 accessible externally (from host)

## Renovate Configuration

### Add to `renovate.json`

```json
{
  "customType": "regex",
  "managerFilePatterns": ["apps/singbox/config.json"],
  "matchStrings": ["\"version\":\\s*\"(?<currentValue>[^\"]+)\""],
  "depNameTemplate": "ghcr.io/sagernet/sing-box",
  "datasourceTemplate": "docker"
}
```

### Behavior

1. Renovate monitors `ghcr.io/sagernet/sing-box` releases
2. Detects new version (e.g., v1.13.0)
3. Creates PR updating:
   - `docker-compose.json`: `image: ghcr.io/sagernet/sing-box:v1.13.0`
   - `config.json`: `version: "1.13.0"`
4. GitHub Action `update-tipi-version.yml`:
   - Increments `tipi_version` (+1)
   - Updates `updated_at` timestamp
   - Runs lint

**Notes:**
- sing-box uses semantic versioning with `v` prefix (v1.12.21)
- Renovate automatically removes `v` prefix in config.json
- Automatic updates for security patches

## Implementation Approach

**Chosen:** Config static + documentation (Approach 1)

**Rationale:**
- Primary use case (RSSHub 403 bypass) needs only basic HTTP proxy
- Form fields not critical (default config works out-of-the-box)
- Advanced users can edit config.json easily
- Zero complexity, zero maintenance scripts
- Follows Runtipi patterns (static files in data/)

**Trade-offs:**
- Form fields become reference documentation only
- Config changes require manual file edit + restart
- Acceptable for target use case

## Success Criteria

1. ✅ sing-box installs via Tipi dashboard
2. ✅ HTTP proxy functional on port 8888 (internal) and 8080 (external)
3. ✅ RSSHub + sing-box integration resolves ProductHunt 403 errors
4. ✅ Advanced users can customize config.json
5. ✅ Renovate automatically tracks sing-box updates
6. ✅ All tests pass (automated + manual)

## Future Enhancements (Out of Scope)

- Dynamic config generation from form fields
- Multiple config presets (minimal, advanced, chain)
- Built-in metrics/monitoring
- Web UI for config editing
