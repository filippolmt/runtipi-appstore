RSS-Bridge is a PHP web application that generates RSS/Atom feeds for websites that don't have one.

It supports over 400 bridges for popular websites including YouTube, Twitter/X, Reddit, Instagram, Facebook, Telegram, and many more. Simply select a bridge, configure the parameters, and get a standard RSS or Atom feed that you can use in any feed reader.

## Features

- **400+ bridges** for popular websites and services
- **Multiple output formats**: RSS 2.0, Atom, JSON, HTML, plain text
- **No JavaScript required** - works as a simple web interface
- **Caching** - built-in cache to reduce requests to source websites
- **Self-hosted** - full control over your data and feeds
- **Lightweight** - minimal resource usage

## Usage

After installation, open the web interface and select a bridge from the list. Configure the bridge parameters (e.g., username, search query) and click "Generate feed". Copy the resulting feed URL into your favorite RSS reader.

## Configuration

Custom configuration can be placed in the `/config` directory. Create a `config.ini.php` file to customize cache settings, enabled bridges, and other options.
