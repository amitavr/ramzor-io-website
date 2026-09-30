# ramzor.io

The public-facing, single-page ramzor.io website. It is separate from the Python
pipeline and the internal Streamlit comparison app.

## Preview

Open [index.html](../index.html) in a browser. No installation, build command, or
development server is required for a visual preview. Scripts, fonts, icons, and
images are local, so the page also renders offline. Submitting the contact form
requires the configured server route and an internet connection.

The header and footer use web-sized copies of the supplied
[logo](Image.jpg); the original artwork is unchanged. The hero is an
original, animated Three.js intersection, not live camera footage or measured
traffic data. Browsers without WebGL display a local PNG of the same scene.

## Service Positioning

The customer-facing offer is a fully managed junction study. ramzor.io supplies
and installs temporary cameras, observes roughly one week of traffic, then
delivers the analysis and a signal-timing proposal. The city does not need to
supply cameras, buy equipment, or set up an IT integration. Lane directions,
volumes, turning movements, and queues support that offer under "Our solution."

This positioning reflects the team's stated service, not new functionality in
this repository. The Python pipeline remains the perception/analytics component;
no optimizer or live signal-control integration is added. The site distinguishes
the installation and study from activation of the proposed cycle, which is
subject to engineering review and controller requirements. Site access, data
handling, service scope, and implementation responsibilities are agreed in
writing for each study. The footer states that ramzor.io is not yet incorporated.

## Before Publishing

1. **Confirm the contact address.** The public address is `contact@ramzor.io`.
   Its mailbox and domain ownership have not been verified by the local checks.
   If it changes, update the displayed addresses and mailto links in
   [index.html](../index.html), the status messages in [site.js](../site.js), and
   the server's `CONTACT_TO_EMAIL` setting. The Worker uses that setting, with
   `contact@ramzor.io` as its fallback recipient.
2. **Review the service commitment and privacy note.** Confirm the roughly
   one-week observation period, camera-deployment arrangements, proposed
   optimization service, data-retention statements, and company status before
   launch. These statements come from the team, not an independent verification.
   The site promises no price, free service, quantified traffic reduction, or
   automatic live activation. Sample report content notes measurement
   limitations; the intersection animation and its counts are illustrative.
3. **Publish using the checked-in Cloudflare Worker configuration.**
   [wrangler.jsonc](../wrangler.jsonc) configures [_worker.js](../_worker.js) with
   Static Assets from the repository root and an `ASSETS` binding; no build step
   is needed. Configure `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` for the target
   deployment, and set `CONTACT_TO_EMAIL` if the recipient should differ from
   the fallback. Keep the API key secret. Verify the sending domain with Resend
   before using an address at `ramzor.io`, and confirm an inquiry reaches the
   intended mailbox before launch.
4. Optionally connect the verified `ramzor.io` domain and enable HTTPS through
   Cloudflare. DNS, deployment, and email-service settings are managed outside
   this repository.

The Worker serves this site-only repository through its Static Assets binding.
Keep credentials and private material out of the publishing branch. For a
visual-only preview on another static host, publish
`index.html`, `styles.css`, `site.js`, `.nojekyll`, and `assets/` with the same
relative layout. Contact submissions also need an equivalent `/api/contact`
endpoint; a static-only deployment cannot send inquiries through the form.

The contact form validates details and submits them to the Cloudflare Worker
route at `/api/contact`. The checked-in `wrangler.jsonc` runs the Worker before
static assets for `/api/*`; `.assetsignore` keeps server/configuration files out
of the public asset bundle. The Worker validates the request, rejects a hidden
spam-trap field, and sends the inquiry through Resend to the configured recipient.
Provider credentials remain in encrypted Cloudflare variables and are never
sent to the browser. A visible email address remains available as a fallback.

## Files

- [index.html](../index.html): content, navigation, sections, and dialogs.
- [styles.css](../styles.css): responsive layouts, local fonts, and brand palette.
- [site.js](../site.js): menu, accessible tabs/dialogs, form submission, and 3D scene.
- [_worker.js](../_worker.js): serves the static site and validates inquiries
  before sending them through the server-side email provider.
- [wrangler.jsonc](../wrangler.jsonc): Worker entry point, Static Assets binding,
  and API routing configuration.
- [.assetsignore](../.assetsignore): excludes server/configuration files and
  repository metadata from the public asset bundle.
- [.nojekyll](../.nojekyll): serve the root site without Jekyll processing.
- [assets/README.md](../assets/README.md): asset sources, pinned dependencies, and
  their bundled licenses.
- [tests/contact-worker.test.mjs](../tests/contact-worker.test.mjs): contact API
  regression tests using Node's built-in test runner and mocked email delivery.

There are no analytics or tracking cookies. The only runtime service request is
the visitor-initiated contact submission to the same-origin Worker route,
which calls the configured email provider. Native anchors and email links remain
usable without JavaScript. Animation pauses outside the viewport and in
background tabs; reduced-motion preferences start the scene paused.

The page currently contains English content. The contact dialog opens from
contact links and can also appear once per session after the visitor has spent
seven seconds on the page and scrolled at least 48% of the scrollable distance.
Session storage records whether that prompt has already been shown.

## Verification

### Responsive review: 2026-09-30

Local browser checks covered the following viewport sizes in headless Chrome:

- Phones: 320 x 568, 360 x 640, 375 x 667, 390 x 844, 412 x 915, 430 x 932.
- Landscape and short screens: 568 x 320, 667 x 375, 844 x 390, 640 x 450.
- Tablets and breakpoint boundaries: 620 x 900, 621 x 900, 700 x 1024,
  701 x 1024, 768 x 1024, 800 x 1024, 801 x 1024, 900 x 900, 901 x 900.
- Desktop: 1024 x 768, 1100 x 800, 1101 x 800, 1280 x 720, 1440 x 900,
  1920 x 1080, 2560 x 1440.

All 26 sizes passed horizontal-overflow and text-clipping checks, loaded local
images, and kept the contact dialog within the viewport with a reachable close
button after scrolling. Hero screenshots were captured at every size;
representative report, observation, About, contact, and full-page screenshots
were also reviewed. No page exceptions or failed asset requests occurred during
this pass. Firefox 156.0.1 additionally passed layout and dialog checks at
320 x 568, 390 x 844, 667 x 375, 621 x 900, 768 x 1024, and 1440 x 900;
canvas pixels confirmed the animated scene rendered.

The changes separate hero text from the illustration at tablet and landscape
sizes, reserve space for the complete illustration on phones, preserve the
space between headline words when the line break is hidden, and keep short-screen
navigation scrollable. Both dialogs retain a close control while their content
scrolls and adapt their maximum height to the dynamic viewport.

Interaction checks passed for mobile navigation, Escape, keyboard observation
tabs, modal keyboard navigation, privacy notice, and focus/scroll restoration
after manual and automatic contact prompts. The once-per-session prompt was
preserved. Contact checks covered required fields, stale versus recent form
timing, confirmed JSON success, another inquiry, server failure, unexpected HTML
responses, duplicate-submit prevention, and recovery after a 20-second timeout.
Failures retain the entered details and a direct mailto link remains available.
Reduced motion, pause/resume, WebGL context loss, unavailable Three.js,
no-JavaScript navigation, and a shortened mobile viewport also passed.

JavaScript syntax checks for `site.js` and `_worker.js`, and `git diff --check`,
passed. There is no application build step in this static repository.
Browser automation used temporary scripts outside the published
asset directory and VS Code's embedded Node runtime.

These are desktop browser/emulation checks, not physical iPhone or Safari tests.
Contact responses in this initial pass were simulated locally; no inquiry was
sent to the team. This initial pass did not publish the changes or verify mailbox
delivery. Additional release checks are recorded below.

### Release follow-up: 2026-09-30

WebKit 26.6 checks passed at 320 x 568, 375 x 667, 390 x 844, 430 x 932,
568 x 320, 667 x 375, 844 x 390, 621 x 900, 768 x 1024, 1024 x 768, and
1440 x 900. All 11 sizes rendered the hero, avoided horizontal/text overflow,
kept dialog controls reachable, and restored focus after closing the contact
form. No page exceptions or failed requests occurred in the completed run.
These tests use Playwright's WebKit build on Windows; physical iPhone/Safari
testing remains a separate device check.

The public HTTPS site responded successfully and `/api/contact` returned HTTP
400 for an empty inquiry, confirming that the route has its required settings
and rejects invalid submissions without sending email. GitHub showed a successful
Cloudflare Workers build for the previous `main` commit.

The Worker now rejects null, arrays, and primitive JSON with HTTP 400. Email
provider network failures and requests that stall for 15 seconds return a
controlled HTTP 502 response, before the browser's 20-second deadline.
The regression suite checks invalid input, the spam trap, provider errors,
timeout, HTML escaping, successful delivery, recipient selection, and static
asset routing. All 24 tests passed without contacting an email service.

Run the server regression checks with Node 24 or newer:

```sh
node --test tests/contact-worker.test.mjs
```

The test directory is excluded from public deployment by `.assetsignore`.
Browser checks also exercise forced rendering errors during initial creation and
resize, image fallback, and WebGL context loss/restoration. Rendering failures
now stop animation and retain the static image instead of escaping from resize
or animation callbacks. The contact and navigation checks were repeated after
this change.

### Historical checks

The following historical checks were recorded on 2026-09-21. They describe the
version tested at that time and are not verification of subsequent changes:

- Nine viewport sizes from 320 x 568 through 1920 x 1080, including 844 x 390
  landscape: no horizontal/text overflow; the first viewport shows a hint of
  the section below the hero.
- Desktop/mobile screenshots and canvas pixel checks; animation advances,
  pauses, and resumes, with the matching button icon and accessible label.
- Mobile navigation, Escape dismissal, modal focus restoration, and input
  validation.
- Reduced-motion preference and a simulated WebGL context loss with the PNG
  fallback loaded and the unavailable animation control hidden.
- Local images and fonts loaded; no page exceptions, failed asset requests, or
  editor diagnostics. The vendored classic Three.js build emits its upstream
  deprecation notice; it is pinned intentionally for direct-file loading.
- After the managed-service copy update: all nine viewport checks repeated,
  desktop/mobile screenshots and canvas pixels reviewed, and the preview's
  animation paused while hidden.
- After relocation: the root entry point loads local images, fonts, scripts,
  and the 3D scene without missing asset requests or page exceptions; the
  contact dialog still works without the old website directory.

The historical JavaScript verification used the browser rather than a Node
syntax command. The environment now has access to VS Code's embedded Node
runtime; that availability does not by itself establish any new test results.
The historical checks did not rerun the separate Python pipeline suite.
