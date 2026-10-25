# Launch checklist

Everything that must be confirmed with the owner, or replaced, before this
concept becomes the real site. Placeholders show on the site with a yellow
highlight and are never put into structured data.

Find any that remain with:

```bash
grep -rn "CONFIRM" src/
```

## 1. Facts to confirm with the owner

All of these live in `src/data/business.json` unless noted.

| # | Placeholder | Where it shows | Where to edit |
| --- | --- | --- | --- |
| 1 | `[CONFIRM: business hours]` | Footer, contact page, service page sidebars | `hours.display`, then `hours.schema` + `hours.confirmed: true` |
| 2 | `[CONFIRM: X] hours` (response time) | Contact page, form thank-you message, thank-you page | `responseTime` |
| 3 | `[CONFIRM: emergency hours, e.g. 24/7?]` | Emergency page under the call button | `emergencyAvailability` |
| 4 | `[CONFIRM: ZIP code]` | Hidden until set; then address and schema | `address.zip` |
| 5 | `[CONFIRM: exact map coordinates ...]` | Schema `geo` (omitted until set) | `geo.latitude`, `geo.longitude` (numbers) |
| 6 | `[CONFIRM: business email]` | Contact page | `email` |
| 7 | `[CONFIRM: licensed?]` and `[CONFIRM: insured? ...]` | Trust bar ("Licensed & Insured"), About page | `trust.licensed`, `trust.insured` |
| 8 | `[CONFIRM: years in business]` | About page | `trust.yearsInBusiness` |
| 9 | `[CONFIRM: ISA Certified Arborist or other certifications]` | About page | `trust.certifications` |
| 10 | `[CONFIRM: owner name]` | About page story placeholder | `ownerName` |
| 11 | `[CONFIRM: legal business name]` | Not shown yet; for footer/legal use | `legalName` |
| 12 | `[CONFIRM: owner story ...]` | About page "Our story" | `src/pages/about.astro` |
| 13 | `[CONFIRM: crane access or partners]` | Emergency page, step 3 | `src/content/services/emergency-tree-service.md` |
| 14 | `[CONFIRM: which oak wilt treatments you offer ...]` | Oak wilt page, step 4 | `src/content/services/oak-wilt.md` |
| 15 | `[CONFIRM: Licensed & Insured]` (trust bar) | Home page trust bar | Clears automatically once #7 is filled in |

Also review the marketing copy with the owner. The pages describe a normal
professional process (written quotes, cleanup included, rigging near homes,
chips left or hauled, landlord coordination, Texas 811 locates before stump
grinding, wood left as firewood on request). Remove or reword anything that
isn't how they actually work.

## 2. Reviews

- [ ] Copy 3 to 12 real Google reviews **word for word** into
      `src/data/reviews.json` (author first name + initial, rating, month, text,
      service). The placeholder cards disappear automatically.
- [ ] Never write, edit or "improve" review text, and don't add reviews that
      aren't on Google.
- [ ] Check the rating and count in `rating` still match Google on launch day.
      Update them now and then.

## 3. Photos

- [ ] Replace the illustrations with real photos. Best: the owner's own job and
      crew photos (with permission). Otherwise free-license Unsplash/Pexels photos.
- [ ] Add each photo's URL, page, photographer and license to
      `src/data/images.json`, then run `npm run images` (rewrites `CREDITS.md`).
      For the owner's own photos, drop WebP files into `public/images/` using the
      same names (e.g. `hero-800.webp`, `hero-1600.webp`) and update the slot's
      credit fields by hand.
- [ ] Replace the About page team photo placeholder (`about-team`).
- [ ] Update alt text in `images.json` so it describes the real photo.
- [ ] Optional: regenerate `public/images/og-default.jpg` with a real photo.

## 4. Contact form

- [ ] Create a Formspree form under the **business owner's** email.
- [ ] Paste its endpoint into `form.endpoint`.
- [ ] Decide on photo uploads: they need a paid Formspree plan. If not, set
      `form.allowPhotoUpload` to `false`.
- [ ] After launch, submit a test request and confirm it arrives.

## 5. Google Business Profile

- [ ] Get the direct "Write a review" link from the Google Business Profile
      (Profile → Ask for reviews → copy link). Put it in `links.googleReview`
      and set `links.googleReviewIsPlaceholder` to `false`.
- [ ] Put the profile's Maps URL in `links.googleProfile`.
- [ ] Add the new website URL to the Google Business Profile.
- [ ] Make sure name, address and phone on the profile match `business.json`
      exactly.
- [ ] Add social profile URLs (if any) to `links.sameAs`.

## 6. Domain and hosting

- [ ] Buy or connect the domain (see README → Custom domain).
- [ ] Set `site.url` in `business.json` to the final `https://` domain.
- [ ] Deploy (GitHub Pages, Netlify or Cloudflare Pages) and confirm HTTPS works.

## 7. Go live

- [ ] Set `"DEMO_MODE": false` in `business.json`.
- [ ] `npm test` passes (build, SEO audit, link check).
- [ ] Spot-check that `robots.txt` allows crawling and lists the sitemap, and that
      page source shows `<meta name="robots" content="index, follow, ...">`.
- [ ] No yellow `[CONFIRM ...]` highlights left anywhere (`grep -rn CONFIRM src/`).
- [ ] Check city pages with the owner: are the landmarks, tree types and towns
      right, and are there other towns they serve?
- [ ] Run Lighthouse on mobile for the home page and one service page.

## 8. After launch

- [ ] Verify the domain in [Google Search Console](https://search.google.com/search-console)
      and submit `https://<domain>/sitemap-index.xml`.
- [ ] Check Bing Webmaster Tools too (it can import from Search Console).
- [ ] Test the structured data with the
      [Rich Results Test](https://search.google.com/test/rich-results) and
      [Schema Markup Validator](https://validator.schema.org/).
- [ ] Ask happy customers for Google reviews using the review link.
- [ ] Revisit the content every few months: add new reviews and real job photos.
