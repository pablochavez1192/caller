# CALLER

Pablo Chávez's portfolio, built as a walkable 1970s telephone exchange seen
through the bezel of a photographed CRT television.

Static site — plain HTML, CSS and JavaScript. No build step, no framework.

**Live:** <https://callersignal.com>

## Structure

```
site/                    Everything that gets deployed
  index.html             Single page
  styles.css             All styles
  script.js              All runtime — room-to-room scroll-walk, TV frame, i18n, contact form
  404.html
  .htaccess              MIME types, gzip, cache headers (Apache / Hostinger)
  robots.txt · sitemap.xml · site.webmanifest
  assets/
    tv/                  TV bezel, knobs, buttons, audio
    buildings/           Poster image per room (-c suffix = portrait crop)
    fonts/               Self-hosted webfonts
    icons/               Favicons, cursors
  rooms/frames/
    to-<room>/           WebP frame sequence for the desktop "walk" transition
    to-<room>-mobile/    Same sequence, portrait
  channels/              Parody TV commercials (landscape + portrait)
  projects/              Case-study preview videos
  vendor/                Self-hosted GSAP and Lenis
```

## Run locally

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

Always serve from inside `site/` — the paths in the code are relative to that folder.

## Deploy

No build step. The contents of `site/` are uploaded as-is to Hostinger's `public_html`.

`styles.css` and `script.js` are cached for a year (see `.htaccess`). After changing
either, bump the `?v=N` query string on both in `index.html` so returning visitors
get the update. If the frame sequences in `rooms/frames/` are regenerated, bump
`FRAMES_VERSION` in `script.js`.

## Third-party

- **GSAP 3.12.5** and **Lenis 1.3.26** — self-hosted in `site/vendor/`
- **Fonts** — Bevan, Caveat, Fraunces, Plus Jakarta Sans, Space Mono — self-hosted in `site/assets/fonts/`
- **Web3Forms** — contact-form submission (public access key lives in `index.html`)

## License

Copyright © 2026 Pablo Chávez. All rights reserved. See [LICENSE](LICENSE).
