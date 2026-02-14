# sing-box App - Architecture Notes

## Overview

sing-box is a universal proxy platform deployed as a single-service application in Runtipi. It provides HTTP/SOCKS proxy capabilities for other applications in the Tipi network.

## Architecture

**Single Service:**
- `singbox-app`: Main proxy service (sagernet/sing-box image)

## Key Implementation Details

### Service Configuration

- **Image**: `ghcr.io/sagernet/sing-box:latest`
- **Port**: Exposes 8888 for HTTP proxy (not exposed to host by default)
- **Volume**: Mounts `${APP_DATA_DIR}/config.json` to `/etc/sing-box/config.json` (read-only)
- **Command**: Runs with `-c /etc/sing-box/config.json -D /etc/sing-box` to use custom config and set working directory

### Default Configuration

The bundled `data/config.json` provides:
- Basic HTTP proxy on port 8888
- Info-level logging with timestamps
- Direct outbound (no upstream proxy)
- Listen on all interfaces (0.0.0.0)

Users can customize this file after installation via `${APP_DATA_DIR}/config.json`.

### No Authentication

The default setup has NO authentication enabled for the proxy. This is intentional for easy integration with other Tipi apps (like RSSHub) but means:
- Only expose within trusted networks
- Consider the security implications for your use case
- Users can add authentication via custom configuration if needed

### Integration Pattern

Designed to work as an infrastructure component for other Tipi apps:

**RSSHub Example:**
```
PROXY_URI=http://singbox:8888
PROXY_PROTOCOL=http
```

**Generic Apps:**
```
HTTP_PROXY=http://singbox:8888
HTTPS_PROXY=http://singbox:8888
```

### Configuration Flexibility

While we provide a basic config, sing-box supports extensive customization:
- Multiple inbound protocols (HTTP, SOCKS5, etc.)
- Complex routing rules
- DNS configuration
- Multiple outbound proxies with failover
- Protocol conversion

Users modify `${APP_DATA_DIR}/config.json` after install and restart the app to apply changes.

## Renovate Tracking

- **Image Updates**: Tracked via global customManager in `renovate.json`
- **Version Field**: Set to "latest" (no per-app Renovate customManager needed)
- **Digest Pinning**: Not enabled by default (can be added if stability issues arise)

## Testing Considerations

After deployment:
1. Verify proxy responds: `curl -x http://singbox:8888 https://example.com`
2. Check logs for startup errors
3. Validate JSON config is valid: `jq . < ${APP_DATA_DIR}/config.json`
4. Test with RSSHub or other client app

## Potential Enhancements

Future improvements could include:
- Form fields for common proxy settings (upstream proxy URL, auth credentials)
- Multiple inbound port options
- Pre-configured routing rule templates
- Health check endpoint (sing-box supports experimental API)
