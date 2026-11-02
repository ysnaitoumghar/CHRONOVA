# CHRONOVA — homepage

Static HTML + CSS + vanilla JS. No build step. Lenis (smooth scroll) loads from a CDN on desktop only; the page works without it.

## Run locally
```bash
python -m http.server 8000      # then open http://localhost:8000
```
(Any static server works. Opening `index.html` directly also works, but use a server to test properly.)

## Structure
```
index.html        page (sections in the brief's order, inline SVG icon sprite)
css/style.css     tokens → base → components → sections → utilities
js/main.js        modules: preloader, announce, header, menu, reveals, parallax, carousel, marquee, footer, bag, newsletter, cursor, smoothScroll
images/           prepared images (WebP 640/1080/1600/2400 + JPG fallback), SELECTION.md
images/raw/       originals — never modified
tools/            retouch.py + prepare_images.py (the image pipeline)
assets/           favicon.svg, apple-touch-icon.png
```

## Swapping images
Every slot is a file-name pattern: `hero-desktop`, `hero-mobile`, `watch-1…4` (+ `-alt`), `craft`, `detail-1`, `detail-2`.
1. Drop better photos into `images/raw/`.
2. In `tools/prepare_images.py`, point the slot in `CROPS` at the new source and crop box (full-resolution coordinates).
3. `pip install pillow numpy opencv-python-headless`, then `python tools/retouch.py && python tools/prepare_images.py`.
   It grades (cool neutral steel), crops to the slot's exact aspect ratio and writes all sizes.
   (`retouch.py` removes the dial wordmarks from the two current sources into `.work/`; skip it for brand-free photos and load them directly.)
No HTML change is needed as long as the file names stay the same. `width`/`height` attributes already match each slot's ratio.

Open Graph / Twitter images are relative (`images/hero-desktop.jpg`). Replace them with absolute URLs once deployed.

## Newsletter backend
`js/main.js`, function `newsletter()`: look for **PLUG A BACKEND HERE**. POST the email to Mailchimp/Brevo/Formspree/a serverless function and show the success state only after it resolves.

## Deploy to GitHub Pages
1. Push the repo to GitHub (keep `index.html` at the root).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Visit `https://<user>.github.io/<repo>/`. All paths are relative, so sub-path hosting works.
Consider not committing `images/raw/` and `.work/` (large).

## Products and bag
Product copy, prices and specs live in the `PRODUCTS` object in `js/main.js`. Each watch opens as a detail view with its own link (`index.html#p-meridian-40`, `#p-equinoxe-39`, `#p-orbital-42`, `#p-solstice-38`). The bag is a slide-in drawer saved in `localStorage`. Checkout is a stub: wire it to your payment provider where the `data-checkout` button is handled.
