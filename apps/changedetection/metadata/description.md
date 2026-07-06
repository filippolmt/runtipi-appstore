# Web Page Change Detection and Monitoring

This self-hosted platform enables users to monitor websites for content changes and trigger automated actions through multiple channels including Discord, Email, Slack, and Telegram.

This app bundles the recommended **sockpuppetbrowser** sidecar (`changedetection-sockpuppetbrowser`), so JavaScript rendering, the Visual Selector and Browser Steps work out of the box — no extra configuration needed.

## Key Capabilities

The service offers a **Visual Selector tool** for targeting specific webpage elements, available when connected to a Playwright content fetcher. Users can examine detected changes at various levels—word, line, or character-by-character comparisons.

## Notable Features

- "Lots of trigger filters, such as 'Trigger on text', 'Remove text by selector', 'Ignore text', 'Extract text'"
- Supports both CSS selectors and xPath targeting
- PDF monitoring with text change, filesize, and checksum tracking
- JavaScript execution capabilities for scenarios like automated login
- Configurable check intervals and screenshot notifications
- Browser automation through "Browser Steps" for actions like form filling and button clicking

## Common Use Cases

The platform serves diverse applications: pricing alerts, stock availability notifications, regulatory compliance tracking, job portal monitoring, website defacement detection, and Pokémon card restock alerts. Users can also monitor JSON API responses, create RSS feeds from content changes, and receive notifications when specific keywords appear in search results.

## Technical Approach

The tool positions itself as an alternative for users prioritizing data privacy, noting: "you have a very sensitive list of URLs to watch and you do _not_ want to use the paid alternatives."
