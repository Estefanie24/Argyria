# Argyria Wellness Center — Prototype

Copy this folder into the root of the existing Argyria project. Expected location:
`Argyria/wellness-center/index.html`

Open `index.html` locally to test. The existing Argyria files are not modified.

## Included
- Mobile-responsive hybrid fantasy/healthcare dashboard
- Hydration counter
- Sleep duration self-entry
- Manual step entry (not sensor-derived)
- Six mood check-in options with general supportive prompts
- 1-, 2-, and 3-minute paced breathing practice; user can stop anytime
- Daily progress against editable personal goals (water, sleep, steps) and mood check-in completion
- Local browser storage and reset function
- Privacy explanation

## Add to Argyria menu after testing
Add a menu link in the main Argyria page:
`<a href="./wellness-center/index.html">Wellness Center</a>`

Do not change the existing menu until the standalone module has been tested.

## Limitations
Self-reported wellness data only; no diagnosis, treatment, medical score, cloud sync, GPS, or step-sensor integration. Data is stored in this browser's local storage. Google Fonts is optional; fallback fonts are provided.
