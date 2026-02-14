# sing-box

sing-box is a universal proxy platform that supports a wide range of proxy protocols and features. It provides a simple HTTP proxy interface that can be used as a forward proxy for applications.

## What is sing-box?

sing-box is a modern, lightweight proxy platform written in Go. It supports multiple proxy protocols including HTTP, SOCKS, Shadowsocks, VMess, VLESS, Trojan, and more. The platform is designed to be:

- **Fast**: Built with performance in mind, using efficient networking libraries
- **Flexible**: Supports multiple protocols and can act as both client and server
- **Easy to configure**: Uses JSON-based configuration with clear structure
- **Resource-efficient**: Low memory footprint and CPU usage

## Default Configuration

This installation comes with a basic HTTP proxy configuration:

- **Proxy Type**: HTTP
- **Listen Address**: 0.0.0.0:8888
- **Outbound**: Direct connection (no upstream proxy)
- **Log Level**: Info

The proxy is accessible within your Tipi network and can be used by other applications.

## Quick Start

Once installed, you can configure applications to use sing-box as their HTTP proxy:

**Environment Variables:**
```
HTTP_PROXY=http://singbox:8888
HTTPS_PROXY=http://singbox:8888
```

**curl example:**
```bash
curl -x http://singbox:8888 https://example.com
```

## Integration with RSSHub

RSSHub can be configured to use sing-box for fetching content from blocked or rate-limited sources:

1. Set RSSHub's proxy environment variables:
   - `PROXY_URI=http://singbox:8888`
   - `PROXY_PROTOCOL=http`

2. Configure sing-box with appropriate upstream proxies for your needs

## Advanced Configuration

The default configuration provides a basic HTTP proxy. You can customize the configuration file at `${APP_DATA_DIR}/config.json` to add more features:

### Chain Multiple Proxies

```json
{
  "outbounds": [
    {
      "type": "http",
      "tag": "upstream-proxy",
      "server": "proxy.example.com",
      "server_port": 8080
    },
    {
      "type": "direct",
      "tag": "direct"
    }
  ]
}
```

### Add SOCKS5 Inbound

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
  ]
}
```

### Configure Routing Rules

```json
{
  "route": {
    "rules": [
      {
        "domain_suffix": [
          "google.com",
          "youtube.com"
        ],
        "outbound": "upstream-proxy"
      },
      {
        "outbound": "direct"
      }
    ]
  }
}
```

## Documentation

For comprehensive configuration options and advanced features:

- Official Documentation: https://sing-box.sagernet.org/
- Configuration Reference: https://sing-box.sagernet.org/configuration/
- GitHub Repository: https://github.com/SagerNet/sing-box

## Use Cases

- **Forward Proxy**: Route application traffic through a proxy server
- **Privacy Layer**: Add an extra layer of privacy for your self-hosted apps
- **Rate Limit Bypass**: Use with RSSHub to access rate-limited content sources
- **Network Policy**: Implement custom routing rules based on domains or IPs
- **Protocol Bridge**: Convert between different proxy protocols

## Security Notes

- The default configuration has no authentication enabled
- Only expose this service within trusted networks
- Consider adding authentication for production deployments
- Review and customize the configuration based on your security requirements
