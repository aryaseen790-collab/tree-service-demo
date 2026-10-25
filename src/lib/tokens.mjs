// Shared token replacement so markdown and frontmatter can say {{city}}
// instead of hard-coding business details. Values come from business.json.
import business from '../data/business.json' with { type: 'json' };

export const tokens = {
  name: business.name,
  city: business.address.city,
  state: business.address.state,
  cityState: `${business.address.city}, ${business.address.state}`,
  county: business.county,
  region: business.region,
  phone: business.phone.display,
  phoneHref: `tel:${business.phone.e164}`,
  ratingValue: business.rating.value.toFixed(1),
  ratingCount: String(business.rating.count),
  responseTime: business.responseTime,
};

export function fillTokens(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (key in tokens ? tokens[key] : m));
}
