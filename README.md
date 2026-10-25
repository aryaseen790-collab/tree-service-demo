# Tree Care Experts: local tree service website

A fast, SEO-ready, multi-page website for a local tree service, built with
[Astro](https://astro.build) (static output) and [Tailwind CSS](https://tailwindcss.com).
Every business detail comes from one file, `src/data/business.json`, so the
site can be reused for another client by editing that file (plus the written
copy in `src/content/`).

> **Demo mode is ON.** This is an unsolicited concept preview. Every page is
> `noindex, nofollow`, `robots.txt` blocks all crawlers, a "Concept preview"
> banner shows at the top, and the quote form posts to *your* Formspree form,
> not the business's. See [Turning off demo mode](#turning-off-demo-mode).

## What's inside

| Page | URL |
| --- | --- |
| Home | `/` |
| Service pages (6) | `/tree-removal/`, `/tree-trimming/`, `/stump-grinding/`, `/emergency-tree-service/`, `/land-clearing/`, `/oak-wilt/` |
| Service area hub + city pages (6) | `/service-areas/`, `/tree-service-temple-tx/`, `/tree-service-belton-tx/`, ... |
| Cost guide | `/tree-removal-cost-temple-tx/` |
| About, Reviews, Contact, Thank you, 404 | `/about/`, `/reviews/`, `/contact/`, `/thank-you/`, `/404.html` |

Every page has a unique title and meta description, canonical URL, Open Graph and
Twitter tags, and `HomeAndConstructionBusiness` JSON-LD. Inner pages add breadcrumb
schema, service pages add `Service` schema, and pages with FAQs add `FAQPage`
schema. `sitemap-index.xml` and `robots.txt` are generated at build time.

(schema.org has no `TreeService` type, so `HomeAndConstructionBusiness` is used.)

## Run it locally

Requires Node.js 20.3 or newer (22 recommended, see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:4321, live reload
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
npm test           # build + SEO audit + broken link check
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run audit` | Checks every built page: title < 60 chars, description < 155, one H1, canonical, no duplicate titles. |
| `npm run check:links` | Checks every internal link, image and `#anchor` in `dist/`. Add `-- --external` to also request external links. |
| `npm run images` | Downloads real photos listed in `src/data/images.json`, converts to WebP and rewrites `CREDITS.md`. |
| `npm run images:placeholders` | Regenerates the illustrated placeholder images, OG image and favicons. |

## Editing `business.json`

`src/data/business.json` is the single source of truth. Change it and rebuild;
the header, footer, forms, schema, meta tags and markdown copy all update.

| Key | What it controls |
| --- | --- |
| `DEMO_MODE` | `true` = noindex + robots block + demo banner + demo form endpoint. Set `false` at launch. |
| `demo.formEndpoint` | Where quote forms post in demo mode (your Formspree form). |
| `demo.yourEmail` / `demo.yourName` | For your reference: the inbox your demo Formspree form forwards to. |
| `site.url` | Production URL, used for canonical links and the sitemap (overridden by `SITE_URL` env var on deploy). |
| `name`, `address`, `phone` | Shown everywhere and in schema. `phone.e164` is used for `tel:` links. |
| `hours` | Set `confirmed: true`, a `display` string and `schema` entries like `{ "days": ["Monday","Tuesday"], "opens": "08:00", "closes": "18:00" }`. Hours only appear in schema once confirmed. |
| `geo` | Latitude/longitude numbers. Left out of schema while `null`. |
| `responseTime`, `emergencyAvailability` | Used on the contact page, form thank-you message and emergency page. |
| `serviceArea` | City list. Each city needs a matching file in `src/content/areas/`. |
| `services` | Slug, name, short blurb and image for each service. Each needs a file in `src/content/services/`. |
| `rating` | Google rating and count. `verified: true` adds `aggregateRating` to schema. Only use real numbers. |
| `trust` | Licensed / insured / years / certifications. Anything still `[CONFIRM ...]` is highlighted on the page and never put in schema. |
| `links.googleReview` | "Leave us a review" button. Replace with the real review link and set `googleReviewIsPlaceholder` to `false`. |
| `form.endpoint` | The business's live Formspree endpoint, used when `DEMO_MODE` is `false`. |

**Placeholders.** Any value that starts with `[CONFIRM` is shown with a yellow
highlight so it's obvious in the demo, and it's automatically kept out of
structured data. `LAUNCH_CHECKLIST.md` lists all of them.

**Written content.** Service, city and cost guide copy lives in markdown under
`src/content/`. You can use tokens such as `{{name}}`, `{{city}}`, `{{cityState}}`,
`{{county}}`, `{{phone}}` and `{{costGuidePath}}`, which are filled in from
`business.json`. Put `<!-- CTA -->` on its own line to insert a call-to-action box.
Phone numbers in copy become tap-to-call links automatically.

**Reviews.** Paste real Google reviews into `src/data/reviews.json`. While it's
empty the site shows clearly labeled placeholder cards. Never write or edit
review text.

**Brand colors and fonts.** Defined as Tailwind theme tokens at the top of
`src/styles/global.css` (`forest-*`, `cream-*`, `accent-*`, `--font-heading`,
`--font-sans`). The font `<link>` is in `src/layouts/BaseLayout.astro`.

**Reusing for another client.** Edit `business.json`, rewrite the markdown in
`src/content/services/` and `src/content/areas/` (city pages must be genuinely
local; don't just swap the city name), replace photos, run
`npm run images:placeholders` to regenerate the OG image and favicons, then build.

## Contact form (Formspree)

1. Create a free account at [formspree.io](https://formspree.io) and a new form.
   The form's email is where leads arrive.
2. Copy the endpoint (looks like `https://formspree.io/f/abcdwxyz`).
3. Demo: paste it into `demo.formEndpoint`. Launch: create a form under the
   **business owner's** email and paste it into `form.endpoint`.

While an endpoint still contains `YOUR_..._FORM_ID`, the form shows the
thank-you message without sending anything, so the demo never errors.
File uploads (photo field) require a paid Formspree plan; on the free plan, set
`form.allowPhotoUpload` to `false` to hide the field. The form has a honeypot
field for spam and works without JavaScript (it falls back to a normal POST).

Prefer Netlify Forms? Add `data-netlify="true"` and a hidden `form-name` input to
the `<form>` in `src/components/QuoteForm.astro` and set the endpoint to `/thank-you/`.

## Turning off demo mode

In `src/data/business.json`:

```json
"DEMO_MODE": false,
```

Then rebuild and deploy. This switches every page to `index, follow`, makes
`robots.txt` allow crawling and point to the sitemap, removes the banner, and
routes the form to `form.endpoint`. Work through `LAUNCH_CHECKLIST.md` first.

## Deploying

### GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds, runs the SEO audit and link
check, and deploys on every push to `main` (or manually from the Actions tab).

1. Merge this work into `main`.
2. In the repo go to **Settings → Pages → Build and deployment** and set
   **Source** to **GitHub Actions**. Ignore the suggested "Jekyll" and
   "Static HTML" workflows; this repo already has its own.
3. Push to `main` (or run the workflow manually). The site appears at
   `https://<user>.github.io/<repo>/`.

If a deploy ran before Pages was turned on, it fails at the
"configure-pages" step. Open that run in the **Actions** tab and click
**Re-run all jobs**, or push any new commit to `main`.

The workflow passes the correct base path (`/<repo>`) and URL to the build, so
links work on a project site without any code changes.

### Netlify

1. **Add new site → Import an existing project** and pick this repo.
2. Netlify reads `netlify.toml` (`npm run build`, publish `dist`). Click Deploy.

Netlify's `URL` environment variable is used automatically for canonical URLs.

### Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git**, pick this repo.
2. Framework preset: **Astro**. Build command `npm run build`, output `dist`.
3. Add environment variable `NODE_VERSION` = `22`.

For both Netlify and Cloudflare, set `site.url` in `business.json` (or a
`SITE_URL` environment variable) to the final domain once you have one.

## Custom domain

**GitHub Pages:** Settings → Pages → Custom domain, enter `www.example.com`, then
at your DNS provider add a `CNAME` record for `www` pointing to
`<user>.github.io`. For the bare domain, add `A` records to GitHub's Pages IPs
(listed in [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)).
Tick **Enforce HTTPS** once the certificate is issued. The workflow picks up the
new domain automatically (base path becomes `/`).

**Netlify / Cloudflare Pages:** Domain settings → Add custom domain, then follow
the DNS instructions shown. HTTPS is automatic.

After switching domains, update `site.url` in `business.json` so canonical links
and the sitemap use it.

## Privacy and performance notes

- No analytics, tracking scripts or cookies. The Google map is click-to-load,
  so nothing is requested from Google Maps until a visitor asks for it.
- Fonts come from Google Fonts with `display=swap`, loaded without blocking the
  first paint.
- CSS is inlined, images are WebP with `srcset`, `width` and `height` (no layout
  shift), and the only JavaScript is a few small inline scripts (menu, map,
  form). The home page weighs about 170 KB.
- Lighthouse (mobile) on the local build: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100 with demo mode off. In demo mode SEO reports a
  lower score only because pages are intentionally `noindex`.

## Images

The demo ships with original illustrations instead of photos (see `CREDITS.md`).
To use real photos, add free-license Unsplash/Pexels URLs to
`src/data/images.json` and run `npm run images`. For launch, real photos of the
crew and their work are the strongest option.
