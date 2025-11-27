# Mailcow

Mailcow is a full-stack, self-hosted mailserver bundle that ships Postfix, Dovecot, Rspamd, SOGo groupware, ACME automation, and an admin UI in one cohesive stack.

## Features
- Complete mail stack with SMTP/IMAP/POP3, anti-spam/AV, and webmail/groupware via SOGo
- Automated TLS with ACME, proxy-friendly nginx frontend, and watchdog health checks
- Redis, MariaDB, and Rspamd integrations for performance and filtering
- Extensive hooks and override directories for custom configs
- Optional IPv6, proxy protocol, and external hostname support

## Tips
- Set strong secrets for DBROOT/DBPASS/REDISPASS and provide your `MAILCOW_HOSTNAME`.
- Map HTTP/HTTPS/SMTP/IMAP ports to available host ports as needed before deployment.
- Back up `${APP_DATA_DIR}` regularly (database, mail storage, SSL, configs).
