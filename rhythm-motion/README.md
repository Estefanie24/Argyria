# Rhythm of Motion — Argyria

A standalone, mobile-first mindful movement activity. This folder is self-contained and does not require a build step or external libraries.

## Files
- `index.html` — page structure and sensor demonstration UI
- `styles.css` — responsive visual design
- `game.js` — motion/orientation input, gameplay, breathing rhythm, counters

## Publish on GitHub Pages
1. Copy the entire `rhythm-motion` folder into the root of your Argyria repository.
2. Keep the folder name exactly `rhythm-motion`.
3. Commit and push the folder.
4. Open `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/rhythm-motion/` on your Android phone.
5. If your site uses a custom Pages path, adjust the URL accordingly.

The relative `../index.html` link returns to the Argyria main page when this folder is placed one level below the repository root. This project does not edit or require changes to any other folder.

## Android test checklist
1. Open the GitHub Pages URL in **Chrome on Android** (not an embedded social-app browser).
2. Confirm the address begins with `https://`.
3. Tap **Enable sensors & start**.
4. Slowly tilt the phone left/right and forward/back. The orb should move and beta/gamma readings should update.
5. Gently move the phone once. Accelerometer X/Y/Z readings should update; a distinct movement may trigger an energy pulse.
6. Guide the orb into the star to increase Energy Sparks.
7. Confirm the breathing prompt cycles and the timer advances.
8. Tap Pause and confirm the timer stops and sensor listeners are removed.

## Sensor notes
- The Generic Sensor API `Gyroscope` is used for raw angular velocity in radians per second when the browser/device exposes it.
- `deviceorientation` provides beta/gamma tilt angles for steering. These are a fallback and are not raw gyroscope readings; browsers may fuse multiple sensors.
- `devicemotion` exposes acceleration and, when available, acceleration including gravity. The page displays whichever usable acceleration object is available.
- Some browser/device combinations restrict sensor access or provide no events. The page shows a status message in that case.
- iOS Safari may require an explicit permission prompt; the code handles browsers that expose `requestPermission()`.
- Motion values stay in page memory and are not sent to a server.

## Wellness and safety
This is a gentle activity, not medical advice or a fitness assessment. Play while seated or standing safely, keep movements small, and stop if you feel dizzy, uncomfortable, or unsteady. Avoid walking while looking at the screen.
