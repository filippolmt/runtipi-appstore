# Nginx

Simple, fast open-source web server to validate your Tipi install or serve static content.

## Features
- Listens on port 80 in the container (mapped via `APP_PORT`, default 8754)
- Minimal configuration out of the box

## Tips
- After install, browse `http://<APP_DOMAIN>` (or `http://nginx.<LOCAL_DOMAIN>`) to see the default welcome page.
- Override the exposed port by setting `APP_PORT` if 8754 conflicts with another service.
