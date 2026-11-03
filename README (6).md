# Argyria — Wellness World

A mobile-first, installable web application that combines eight game experiences, a shared movement tracker, optional wellness journaling, relaxation guidance, nutrition education and a local rewards collection.

## Run locally

Because device sensors, GPS and service workers require a secure context, use GitHub Pages, Netlify, or a local HTTPS development server. Opening `index.html` directly with `file://` is not a valid test for GPS, sensors or PWA installation.

## Deploy to GitHub Pages

1. Extract this ZIP.
2. Upload the **contents** of this `Argyria` folder to the repository root (keep all subfolders intact).
3. In GitHub, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Open the published URL on a phone. Install the PWA from the browser menu if desired.

## Included experiences

### Existing games preserved
- `motion-lab/` — Motion Lab
- `aether-cauldron/` — Aether Cauldron
- `zone-runner/` — Zone Runner

### New games
- `games.html?game=relax` — Relaxation Sanctuary (guided visual breathing session and optional ambient audio)
- `games.html?game=nutrition` — Nutrition Quest (interactive nutrition knowledge quiz)
- `games.html?game=crystal` — Crystal Focus (sequence-memory puzzle)
- `games.html?game=garden` — Garden of Vitality (virtual collection linked to optional wellness actions)
- `games.html?game=rhythm` — Rhythm of Motion (timed beat-tapping activity)

### Shared services
- `route-lab/` — GPS route, distance and movement tracker
- Wellness journal — mood, water, sleep and manually entered steps
- Rewards — persistent local collectibles and achievements
- Settings — preferences, JSON export and local data deletion

## Data and privacy

The application uses browser `localStorage` for wellness entries, preferences and rewards. Data remains in the browser on that device; it is not synced to an Argyria account. Export a JSON backup before changing devices or clearing browser data. GPS route records are handled by Route Lab's own storage implementation. Review that page's storage and permission behavior before collecting real-world data.

## Measurement and safety notes

- Mood suggestions are supportive and non-diagnostic.
- Water, sleep and manually entered steps are self-reported records.
- Route Lab GPS distance and sensor-estimated steps are distinct measurements and may be inaccurate.
- Motion and GPS require compatible devices, permissions and a secure HTTPS origin.
- Map tiles and external libraries may require an internet connection; the PWA does not promise fully offline maps.
- Games and wellness activities are not medical devices and do not diagnose or treat conditions.

## Artwork

The `assets/images/` and audio assets are initial production artwork supplied for the project. They are intentionally stored separately from game logic so the artwork can be replaced or upgraded later without rewriting the interactions. Some image filenames contain spaces and non-English characters; keep filenames and folder paths unchanged when deploying.

## Verification status

Source-level syntax and internal navigation checks should be completed after each update. Real-device testing is still required for camera, motion, GPS, audio autoplay, installation, responsive behavior, battery use and accessibility. Passing a JavaScript syntax check is not proof that a game mechanic works on every phone.
