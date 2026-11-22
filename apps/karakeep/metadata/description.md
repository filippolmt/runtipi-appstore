## Karakeep

Karakeep is a self-hosted bookmark manager that lets you save links, notes, and images in one searchable place.

## Features

- Save bookmarks, text notes, and images
- Automatic page metadata and content fetching
- Full-text search powered by Meilisearch
- Lists, tags, and bulk organization
- Browser extensions and mobile apps
- Optional AI-powered automatic tagging with OpenAI

## First Run

Open Karakeep after installation and create your account. The first registered user becomes an administrator.

AI configuration is optional. OpenAI works with the default settings. For Ollama Cloud, use your Ollama API key, set the base URL to `https://ollama.com/v1`, choose compatible text and image models, and disable **Use Max Completion Tokens** and **Automatic Embedding Indexing**. Without an AI provider, all core bookmarking, search, and organization features remain available.

## Search Index Recovery

Meilisearch migrates its database automatically after each version update. If a migration is interrupted and search stops working, stop the app, delete `data/meilisearch` in the app data folder, start the app, then open `Admin Settings > Background Jobs` and click `Reindex All Bookmarks`. If AI embeddings are enabled, also click `Regenerate Embeddings for All Bookmarks` (this sends every bookmark to your AI provider again).

## Links

- [Website](https://karakeep.app/)
- [Documentation](https://docs.karakeep.app/)
- [Source code](https://github.com/karakeep-app/karakeep)
