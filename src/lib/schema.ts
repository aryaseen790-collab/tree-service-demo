import { biz, isPlaceholder, absUrl } from './site';

type Crumb = { name: string; href: string };
type Faq = { q: string; a: string };

const clean = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')) as T;

/**
 * LocalBusiness JSON-LD. schema.org has no "TreeService" type, so this uses
 * HomeAndConstructionBusiness. Unconfirmed fields ([CONFIRM ...]) are left out
 * on purpose so search engines never see placeholder data.
 */
export function localBusiness(site: URL | undefined) {
  const id = absUrl('/', site) + '#business';
  const a = biz.address;
  const hasGeo = typeof biz.geo.latitude === 'number' && typeof biz.geo.longitude === 'number';
  return clean({
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': id,
    name: biz.name,
    url: absUrl('/', site),
    telephone: biz.phone.e164,
    email: isPlaceholder(biz.email) ? undefined : biz.email,
    image: absUrl(biz.site.defaultOgImage, site),
    logo: absUrl('/icon-512.png', site),
    priceRange: undefined,
    address: clean({
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: isPlaceholder(a.zip) ? undefined : a.zip,
      addressCountry: a.country,
    }),
    geo: hasGeo ? { '@type': 'GeoCoordinates', latitude: biz.geo.latitude, longitude: biz.geo.longitude } : undefined,
    openingHoursSpecification:
      biz.hours.confirmed && biz.hours.schema.length
        ? biz.hours.schema.map((h: { days: string[]; opens: string; closes: string }) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.days,
            opens: h.opens,
            closes: h.closes,
          }))
        : undefined,
    areaServed: biz.serviceArea.map((c) => ({ '@type': 'City', name: `${c}, ${biz.address.stateFull}` })),
    aggregateRating: biz.rating.verified
      ? { '@type': 'AggregateRating', ratingValue: biz.rating.value, reviewCount: biz.rating.count, bestRating: 5, worstRating: 1 }
      : undefined,
    sameAs: biz.links.sameAs.length ? biz.links.sameAs : undefined,
    makesOffer: biz.services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, url: absUrl(`/${s.slug}/`, site) },
    })),
  });
}

export function serviceSchema(site: URL | undefined, name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType: name,
    description,
    url: absUrl(path, site),
    provider: { '@id': absUrl('/', site) + '#business' },
    areaServed: biz.serviceArea.map((c) => ({ '@type': 'City', name: `${c}, ${biz.address.stateFull}` })),
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(site: URL | undefined, crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.href, site),
    })),
  };
}
