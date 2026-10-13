# Golden Sands Bullion Trading - Project Memory

## Project Overview
**Repository:** https://github.com/simhaonline/goldensandsbullion.com
**Project Root:** C:\Users\Mehulkumar Bhatt\Downloads\goldensandsbullion.com
**Live Domain:** goldensandsbullion.com

## Tech Stack
- **Frontend:** Single-page HTML5 with semantic markup
- **Styling:** Custom CSS (assets/css/style.css) with CSS custom properties
- **JavaScript:** Vanilla ES6+ modules (assets/js/main.js)
- **PWA:** Service Worker v2.0.0 (sw.js), Web App Manifest (manifest.json, manifest.webmanifest)
- **Performance:** Resource preloading, async CSS, deferred JS, IntersectionObserver lazy loading, scroll debouncing
- **Hosting:** Static hosting (GitHub Pages compatible)

## Key Features
1. **Live XAU/USD Rates Engine** - Real-time gold/silver spot pricing from multiple API fallbacks (gold-api.com, Binance PAXGUSDT, CoinGecko)
2. **Bullion Investment Calculator** - Weight/unit/currency conversion with live rates
3. **Product Catalog** - Filterable grid of gold bars, sovereign coins, silver bars
4. **PWA Support** - Installable, offline-capable, app shortcuts, push notification ready
5. **Regulatory Transparency** - Meydan FZ License 2651106.01, FTA TRN 105588382900001, Dubai Customs AE-1216587
6. **Arabic RTL Support** - Dir=ltr with Arabic content support

## Recent Changes (v2.0.0 - 2026-10-13)

### Performance Optimizations
- Preloaded critical resources (hero WebP, logo SVG, fonts, main.js)
- Async CSS loading via print media hack + noscript fallback
- Deferred main.js execution
- Service Worker v2.0.0 with multi-cache strategy:
  - Static cache (app shell)
  - Image cache (stale-while-revalidate)
  - API cache (network-first)
- Background sync for offline form submissions
- Push notification infrastructure

### PWA Enhancements
- Updated manifest with screenshots (Screenshot_1.png, Screenshot_2.png)
- 4 app shortcuts: Live Rates, Calculator, Credentials, Contact
- Protocol handlers (web+bullion)
- Maskable icons for Android
- Launch handler config (focus-existing)

### JavaScript Optimizations
- IntersectionObserver-based lazy loading for images
- Scroll handler debouncing (16ms / ~60fps)
- Preconnect to critical API origins
- Hover-based link prefetching
- Web Vitals monitoring (LCP, FID, CLS)
- Reduced motion support
- Service Worker update notifications

### Server Config (.htaccess)
- 1-year cache for static assets
- 1-hour cache for HTML
- Gzip/Deflate compression
- Security headers (CSP, X-Frame-Options, etc.)

### Content Updates (Latest Commit)
- Phone: +971 58 568 9509 → +971 50 641 0882 (all locations)
- Top bar license: "2651106.01 (Meydan FZ)" → "2651106.01"
- Removed "Live Rates" from navigation menu
- Logo: "GOLDEN SANDS" only (removed "BULLION TRADING L.L.C-FZ")
- Hero trust metrics: Removed "Dubai Customs Code: AE-1216587"

## File Structure
```
goldensandsbullion.com/
├── index.html              # Main HTML (1646 lines)
├── sw.js                   # Service Worker v2.0.0
├── manifest.json           # PWA manifest
├── manifest.webmanifest    # PWA manifest (alt)
├── .htaccess              # Apache performance config
├── README.md              # Project documentation
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── Screenshot_1.png       # PWA screenshot (1919x965)
├── Screenshot_2.png       # PWA screenshot (1919x966)
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   └── main.js        # Application logic (1000+ lines)
│   ├── images/            # JPG/PNG originals + WebP variants
│   └── icons/             # Favicons, app icons, logos
└── node_modules/          # Local dev dependencies
```

## API Endpoints Used
- `https://api.gold-api.com/price/XAU` - Primary gold price
- `https://api.gold-api.com/price/XAG` - Primary silver price
- `https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT` - Fallback gold
- `https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd` - Fallback gold

## Constants
- USD/AED Peg: 3.6725 (UAE Central Bank fixed)
- Troy Ounce → Grams: 31.1034768
- Tola → Grams: 11.6638038

## Contact Information
- **Phone/WhatsApp:** +971 50 641 0882
- **Email:** info@goldensandsbullion.com
- **Address:** Office 101, Meydan Grandstand, 6th Floor, Nad Al Sheba, Dubai, UAE
- **Trading Hours:** Mon-Fri 09:00-18:00 GST, Sat by appointment

## Regulatory Credentials
- **Meydan FZ License:** 2651106.01 (Formation: 2651106)
- **Activity Code:** 4752.77 (Non-Manufactured Precious Metal Trading)
- **FTA TRN:** 105588382900001
- **Dubai Customs Mirsal:** AE-1216587
- **Executive Manager:** Suhail Salem Ahmed Amer Alameri

## Deployment Notes
- Push to main branch auto-deploys to GitHub Pages
- Service Worker scope: `./` (root-relative)
- All paths use relative URLs for portability
- WebP images served with picture element fallbacks
- No build step required - pure static files

## Known Issues / Future Work
- API rate limits on gold-api.com (25s polling interval mitigates)
- WhatsApp link uses wa.me - verify business account linked
- JSON-LD telephone still shows masked version in some places
- Consider adding CSP nonce for inline scripts
- Arabic translation for full RTL support