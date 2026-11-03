# Argyria build verification report

Date: 2026-11-03

## Automated source checks

- JavaScript syntax checked with Node.js for every inline script in all HTML pages: **0 syntax errors**.
- Local HTTP smoke test with Python's static server: **HTTP 200** for the main page, game page, all five game query routes, Motion Lab, Aether Cauldron, Zone Runner, Route Lab, manifest and service worker.
- Key local image assets referenced by the home and game screens: **present**.
- Existing game source folders retained: Motion Lab, Aether Cauldron and Zone Runner.
- Billiards Lab and Maze Worlds are not included as launch destinations. Route Lab's embedded maze cards are hidden by its existing page styling.

## Not verified by these checks

- Actual game mechanics in a live browser session.
- Camera or hand tracking, if used by a source game.
- iOS/Android accelerometer, gyroscope and orientation permission flows.
- GPS accuracy, step-estimation accuracy or route recording on a physical device.
- Audio playback behavior on mobile.
- PWA installation and offline behavior across browsers.
- Accessibility and usability with external users.

## Required next validation

Deploy to HTTPS and test on at least one iPhone and one Android device. Record browser/device versions, permissions, test steps, expected outcomes and actual outcomes. Do not describe source-level checks as proof of clinical benefit or complete mobile compatibility.
