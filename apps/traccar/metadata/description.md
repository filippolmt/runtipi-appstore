# Traccar

Traccar is an open-source GPS tracking platform with a web interface and support for hundreds of device protocols.

## Features
- Web UI on port 8082 for device management, maps, and alerts
- Default listener range 5000-5150 (TCP/UDP) for common GPS device protocols
- Persistent volumes for logs, data, and optional custom `traccar.xml`
- Health-checked service for reliable startup

## Tips
- To customize server settings, place your `traccar.xml` in `${APP_DATA_DIR}/config/traccar.xml` before first start.
- Expose only the listener ports you actually need if your setup is restricted.
- For production, consider switching database in `traccar.xml` to MySQL/PostgreSQL.
