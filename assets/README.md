# Website assets

These assets are stored locally so the public page also works from a `file:` URL,
without a build step, CDN, font service, or connection to the analysis pipeline.

- `ramzor-logo.png` and `favicon.png`: web-sized derivatives of the user-supplied
  [brand artwork](../docs/Image.jpg). The original is unchanged.
- `intersection-fallback.png`: a PNG exported from the original Three.js scene,
  used while the hero loads and for browsers without WebGL. It contains no
  customer footage or measured data. The observation section adds explanatory
  overlays in the interactive scene; they are not baked into this still.
- `three.min.js`: Three.js **0.160.1**, the last release series with a classic
  browser build. Source: <https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js>.
  License: `three-LICENSE.txt` (MIT).
- `lucide.min.js`: Lucide **0.468.0**, classic browser build. Source:
  <https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js>.
  License: `lucide-LICENSE.txt` (ISC, with notices for derived icons).
- `manrope-latin.woff2` and `space-grotesk-latin.woff2`: Latin variable-font
  subsets supplied by Google Fonts. Licenses: `manrope-OFL.txt` and
  `space-grotesk-OFL.txt` (SIL Open Font License 1.1).

The intersection is an original illustrative scene constructed with Three.js.
It is not a live camera, a traffic simulation, or measured product output.
No third-party photography or customer video is used.

The hero and observation scene share one Three.js library request, triggered
when either section approaches the viewport. Each scene initializes separately
and pauses offscreen. No asset or dependency was added for the redesign or hero
restoration. Publication-approved images or videos can replace the demo using
the media slots documented in
[the website README](../README.md); private pipeline footage must not be copied
here without approval and a privacy review.