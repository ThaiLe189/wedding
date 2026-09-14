# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page wedding invitation site for Hoàng Thái & Huyền Nhu (22.11.2026). Vietnamese-language content throughout — copy in `src/data/wedding.js` and JSX is Vietnamese, keep it that way when editing text. Plain React + Vite, no backend, no router, no state management library.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

No test suite, no linter, no TypeScript configured in this repo — don't assume `npm test`/`npm run lint` exist.

## Architecture

Everything renders through one component tree with no routing: `main.jsx` → `App.jsx` → section components, all mounted at once on a single scrolling page (`#story`, `#details`, `#guide`, `#gallery`, `#stay`, `#rsvp` anchors).

- `src/data/wedding.js` is the single source of truth for content: couple names, date, venue, schedule array, gallery photo list (imports the actual image files so Vite fingerprints them), and `revealSelectors` (a CSS selector list consumed by the scroll-reveal hook). Change wedding details here, not inline in components.
- `src/components/sections.jsx` holds every page section (`HeroSection`, `StorySection`, `DetailsSection`, `GuestGuideSection`, `GallerySection`, `StaySection`, `RsvpSection`) as named exports in one file — this is intentional for a site this size, don't split it up preemptively.
- `src/components/Layout.jsx` holds chrome shared across the page: `SiteIntro` (the opening invitation-cover animation, currently disabled — see below), `Header`, `Footer`.
- `src/components/Decorations.jsx` holds purely decorative, `aria-hidden` pieces: `SiteBackdrop` (fixed crane/cloud illustration layer behind everything), `CraneField` (per-section crane accent, takes a `placement` prop), `RsvpBloom` (small burst animation after RSVP submit).
- `src/hooks/useScrollReveal.js` is a generic IntersectionObserver hook — pass it a selector string (from `revealSelectors`) and it adds `.is-visible` to matching elements as they scroll into view, and no-ops (marks everything visible immediately) when `prefers-reduced-motion` is set or `IntersectionObserver` is unavailable.
- `src/utils/calendar.js` builds an `.ics` file client-side from `wedding` data and triggers a download — no backend involved.
- **RSVP form (`RsvpSection` in `sections.jsx`) does not persist anywhere yet** — `submitRsvp` just shows a thank-you message and resets the form. See `TODO.md` before assuming responses are saved.

### Styles

Plain CSS, no Tailwind/CSS-in-JS/modules. `src/design/styles/index.css` is the entry point and defines load order via `@import`: `styles.css` → `animations.css` → `location.css` → `app.css` → `responsive.css` → `backdrop.css`. When adding styles, put them in the file matching that role (layout/component styles → `app.css`, keyframes/transitions → `animations.css`, breakpoints → `responsive.css`, the fixed backdrop illustration → `backdrop.css`) rather than creating new files, and respect the existing import order if a new file is ever needed.

### Assets

`src/design/assets/` holds hero/portrait PNGs (currently 2–4 MB each, unoptimized — see `TODO.md`) and `src/design/assets/gallery/` holds the JPG album. Imported directly into JS so Vite handles hashing/bundling — don't reference them by static `/public` path.

## Known gaps (see TODO.md for full detail)

`TODO.md` is actively maintained by the project owner and lists pending work in priority order (Vietnamese). Check it before starting unprompted improvements — items already listed there are known/wanted; anything under "Đã quyết định không làm" (decided against) should not be re-proposed. Notable current gaps: RSVP doesn't persist responses anywhere, images are unoptimized, no Open Graph tags, opening invitation-cover screen is deliberately commented out in `App.jsx`.
