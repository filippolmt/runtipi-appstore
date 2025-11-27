# KitchenOwl

KitchenOwl is an open-source grocery list and recipe manager with shared access, meal planning, and a responsive web interface.

## Features
- Collaborative grocery lists with categories and price tracking
- Recipe storage that links ingredients directly to your shopping list
- Meal planner and pantry overview for weekly prep
- PWA-style interface that works well on mobile and desktop
- SQLite-backed data stored under `${APP_DATA_DIR}/data`

## Tips
- Set a strong JWT secret to secure user sessions.
- Point `FRONT_URL` to your Tipi/Traefik domain (e.g., `https://${APP_DOMAIN}`) so the frontend loads correctly.
- Expose the UI on port `8080` (or your chosen Tipi port) to access it from your browser.
- Back up `${APP_DATA_DIR}/data` to preserve recipes and shopping history.
