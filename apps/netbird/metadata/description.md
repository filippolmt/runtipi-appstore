# NetBird

Self-hosted control plane for [NetBird](https://netbird.io), a WireGuard-based overlay network. This app runs the combined NetBird server (management, signal, relay, STUN and the embedded identity provider) together with the management dashboard.

## Requirements

This app **cannot run on a local IP address**. NetBird peers connect to the control plane from the public internet, so all three of the following must be true before you install it:

1. **A public domain name** pointing to this host, configured as the app domain in Runtipi. The app is forced to be exposed for this reason.
2. **TCP port 443 reachable from the internet**, so peers can reach the management API, the signal service, the relay and the built-in login flow. Runtipi's reverse proxy handles TLS and the certificate.
3. **UDP port 3478 forwarded to this host**, for the embedded STUN server. Without it, peers behind NAT fall back to the relay for every connection, or fail to connect at all.

## Authentication

The server ships with an embedded identity provider, so no external IdP (Zitadel, Keycloak, Authentik, Auth0…) is required. Users are created and managed locally from the dashboard.

## Storage

By default the control plane stores its state in SQLite under the app data directory, which is included in Runtipi's app backups. This is appropriate for a normal self-hosted deployment.

If you already run a PostgreSQL server, fill the optional **External PostgreSQL DSN** field at install time and NetBird will use it instead. PostgreSQL is only needed when you want concurrent access from multiple management instances; a single instance does not require it.

## After installation

1. Open the dashboard at your app domain and create the first user.
2. Install the [NetBird client](https://docs.netbird.io/how-to/getting-started) on each machine.
3. Point the client at your own server when connecting:

   ```
   netbird up --management-url https://your-domain.example.com
   ```

Peers are reachable from each other under the internal DNS domain `netbird.selfhosted`.
