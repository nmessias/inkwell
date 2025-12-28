# E-ink Royal

A Royal Road proxy optimized for Kindle e-ink browsers. This server scrapes Royal Road and presents the content in a simplified, e-ink-friendly format with no JavaScript requirements for basic navigation.

## Features

- **E-ink Optimized** - High contrast, large touch targets, no animations
- **Offline-First** - Aggressive caching for low-bandwidth situations
- **Reader Mode** - Paginated chapter view with tap/click navigation
- **Dark Mode** - Toggle between light and dark themes
- **Session Sync** - Uses your Royal Road cookies to sync reading progress
- **Background Caching** - Pre-caches your follows and toplists

## Requirements

- [Bun](https://bun.sh) runtime (v1.0+)
- Chromium-based browser (installed automatically by Playwright)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kindle-royal-proxy.git
cd kindle-royal-proxy

# Install dependencies
bun install

# Install Playwright browsers (first time only)
bunx playwright install chromium
```

## Configuration

Create a `.env` file (optional):

```bash
PORT=3000  # Server port (default: 3000)
```

## Usage

```bash
# Start the server
bun run start

# Development mode (with auto-reload)
bun run dev
```

Then access the proxy from your Kindle browser at:
```
http://<your-server-ip>:3000
```

## Setup

1. Navigate to `/setup` on the proxy
2. Copy your Royal Road session cookies from your browser:
   - `.AspNetCore.Identity.Application` (required)
   - `cf_clearance` (optional, for Cloudflare)
3. Paste them into the setup form
4. Click "Save Cookies"

Your reading progress will now sync with Royal Road.

## Project Structure

```
kindle-royal-proxy/
├── public/              # Static assets (CSS, JS, fonts)
│   ├── css/
│   ├── fonts/
│   └── js/
├── src/
│   ├── config.ts        # Configuration constants
│   ├── index.ts         # Entry point
│   ├── server.ts        # HTTP utilities
│   ├── types.ts         # TypeScript types
│   ├── routes/          # Route handlers
│   │   ├── api.ts       # JSON API routes
│   │   ├── index.ts     # Router
│   │   └── pages.ts     # HTML page routes
│   ├── services/        # Business logic
│   │   ├── cache.ts     # SQLite cache
│   │   ├── jobs.ts      # Background jobs
│   │   └── scraper.ts   # Playwright scraper
│   └── templates/       # HTML templates
│       ├── components.ts
│       ├── layout.ts
│       └── pages/
├── data/                # SQLite database (created on first run)
└── package.json
```

## How It Works

1. **Scraping** - Uses Playwright with stealth settings to scrape Royal Road
2. **Caching** - Stores content in SQLite with configurable TTLs
3. **Templates** - Server-side rendered HTML optimized for e-ink
4. **Reader** - Paginated chapter view with CSS columns and tap zones

## Kindle Tips

- Use the **tap zones** (top/bottom 15%) to toggle the UI
- Use **left/right zones** (40% each side) to navigate pages
- The proxy uses **ES5 JavaScript** for maximum Kindle compatibility
- Consider setting the Kindle browser to **desktop mode** for better rendering

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This project is not affiliated with Royal Road. Use responsibly and in accordance with Royal Road's Terms of Service.
