## Introduction

RSSHub is an open source, easy to use, and extensible RSS feed generator. It's capable of generating RSS feeds from pretty much everything.

RSSHub delivers millions of contents aggregated from all kinds of sources, our vibrant open source community is ensuring the deliver of RSSHub's new routes, new features and bug fixes.

RSSHub can be used with browser extension [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) and mobile auxiliary app [RSSBud (iOS)](https://github.com/Cay-Zhang/RSSBud) and [RSSAid (Android)](https://github.com/LeetaoGoooo/RSSAid)

[English docs](https://docs.rsshub.app/) | [Telegram Group](https://t.me/rsshub) | [Telegram Channel](https://t.me/awesomeRSSHub) | [Twitter](https://twitter.com/intent/follow?screen_name=_RSSHub)

## Proxy Configuration

To bypass 403 Forbidden errors (e.g., ProductHunt, Twitter), configure a proxy:

### Option 1: sing-box (Recommended)

Install the **sing-box** app from the Tipi store:

1. Go to Tipi App Store
2. Search for "sing-box"
3. Click Install
4. RSSHub will automatically use sing-box (pre-configured to `http://singbox:8888`)

No additional configuration needed - works out of the box!

### Option 2: Custom Proxy

If you have an existing proxy server:

1. In RSSHub settings, set **Proxy URI** to your proxy URL
2. Examples:
   - HTTP proxy: `http://proxy.example.com:8080`
   - SOCKS5 proxy: `socks5://proxy.example.com:1080`

### Option 3: Disable Proxy

Leave **Proxy URI** empty to connect directly (no proxy).

## Usage

In order to generate a feed, a valid URL with parameters has to be appended to the main domain for your RSSHub instance, varying with each different app. More on the how-to's for each supported service or app can be found on [https://docs.rsshub.app/guide/](https://docs.rsshub.app/guide/), and on [https://docs.rsshub.app/guide/parameters](https://docs.rsshub.app/guide/parameters) for filtering/sorting/limiting your feed in a given URL.

## Access Control

RSSHub provides an access control feature for restricting which user generates a feed within your instance. This can be enabled with the `ACCESS_KEY` field during installation. Default value is empty, which means no extra key is required in order to access a feed through the URLs.

## Related Projects

- [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar): A browser extension that can help you quickly discover and subscribe to the RSS and RSSHub of current websites.
- [RSSBud](https://github.com/Cay-Zhang/RSSBud): RSSHub Radar for iOS platform, designed specifically for mobile ecosystem optimization.
- [RSSAid](https://github.com/LeetaoGoooo/RSSAid): RSSHub Radar for Android platform built with Flutter.
