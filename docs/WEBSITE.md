# ramzor.io

The public-facing, single-page ramzor.io website. It is separate from the Python
pipeline and the internal Streamlit comparison app.

## Preview

Open [index.html](../index.html) in a browser. No installation, build command, or
development server is required. Scripts, fonts, icons, and images are local, so
the site also works offline.

The header and footer use web-sized copies of the supplied
[logo](Image.jpg); the original artwork is unchanged. The hero is an
original, animated Three.js intersection, not live camera footage or measured
traffic data. Browsers without WebGL display a local PNG of the same scene.

## Service Positioning

The customer-facing offer is a low-cost, fully managed junction study. Ramzor
supplies and installs its own cameras, collects the footage, and delivers the
analysis and an optimized traffic-light cycle proposal one week after camera
installation. The city does not need to supply cameras, buy equipment, or set
up an IT integration. Lane directions, volumes, turning movements, and queues
support that offer under "Our solution" rather than leading as separate data
products.

This positioning reflects the team's stated service, not new functionality in
this repository. The Python pipeline remains the perception/analytics component;
no optimizer or live signal-control integration is added. The site distinguishes
the installation and study from activation of the proposed cycle, which is
subject to city approval and controller requirements. Site access and necessary
installation permissions are agreed before the one-week study begins.

## Before Publishing

1. **Confirm the contact address.** The public address is `contact@ramzor.io`.
   Its mailbox and domain ownership have not been verified. Update the mailto
  links and displayed address in [index.html](../index.html) if needed; the inquiry
   script reads the recipient from the footer link.
2. **Review the service commitment and privacy note.** Confirm the one-week
  delivery from installation, ramzor's camera-deployment arrangements,
  low-cost positioning, and ownership of the optimization service before
  launch. The timeline and commercial positioning come from the team, not an
  independent verification. No price or free service is promised. Queue/wait
  analysis remains marked as in validation; the site does not promise automatic
  live activation or quantified traffic reductions.
3. **Publish from the repository root with Cloudflare Pages.** Connect the
   `ramzor-io-website` repository, use `main` as the production branch, choose
   no framework preset, leave the build command blank, and use `.` as the build
   output directory. No environment variables or build token are required.
4. Optionally connect the verified `ramzor.io` domain and enable HTTPS through
   Cloudflare. DNS, deployment, and email-service settings are managed outside
   this repository.

Cloudflare Pages serves this site-only repository directly. Keep credentials and
private material out of the publishing branch. For another static host, publish
`index.html`, `styles.css`, `site.js`, `.nojekyll`, and `assets/` with the same
relative layout.

The contact form validates details and prepares a mailto draft. Visitors must
open and send it through their email client. It does not submit inquiries to a
server, persist contact details, or claim that an email was sent. A visitor
without a configured email client can use the visible address directly.

## Files

- [index.html](../index.html): content, navigation, sections, FAQs, and dialogs.
- [styles.css](../styles.css): responsive layouts, local fonts, and brand palette.
- [site.js](../site.js): menu, accessible tabs/dialogs, email draft, and 3D scene.
- [.nojekyll](../.nojekyll): serve the root site without Jekyll processing.
- [assets/README.md](../assets/README.md): asset sources, pinned dependencies, and
  their bundled licenses.

There are no analytics, cookies, CDN requests, or backend dependencies. Native
anchors and email links remain usable without JavaScript. Animation pauses
outside the viewport and in background tabs; reduced-motion preferences start
the scene paused.

## Verification

Browser checks on 2026-09-21 covered:

- Nine viewport sizes from 320 x 568 through 1920 x 1080, including 844 x 390
  landscape: no horizontal/text overflow; the first viewport shows a hint of
  the section below the hero.
- Desktop/mobile screenshots and canvas pixel checks; animation advances,
  pauses, and resumes, with the matching button icon and accessible label.
- Mobile navigation, Escape dismissal, keyboard audience tabs, FAQ expansion,
  modal focus restoration, input validation, and encoded email-draft content.
- Reduced-motion preference and a simulated WebGL context loss with the PNG
  fallback loaded and the unavailable animation control hidden.
- Local images and fonts loaded; no page exceptions, failed asset requests, or
  editor diagnostics. The vendored classic Three.js build emits its upstream
  deprecation notice; it is pinned intentionally for direct-file loading.
- After the managed-service copy update: all nine viewport checks repeated,
  desktop/mobile screenshots and canvas pixels reviewed, and the one-week
  study inquiry's email encoding checked. Audience tabs retain equal heights
  at 1440, 390, 375, and 320px; the shared preview pauses animation while hidden.
- After relocation: the root entry point loads local images, fonts, scripts,
  and the 3D scene without missing asset requests or page exceptions; the
  contact dialog still works without the old website directory.

Node is unavailable in this environment, so JavaScript was verified in the
browser rather than with a Node syntax command. No pipeline code changed and
the Python suite was not rerun for this isolated website addition.
