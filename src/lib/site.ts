import business from '../data/business.json';
import { fillTokens, tokens } from './tokens.mjs';

export const biz = business;
export { fillTokens, tokens };

const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const DEMO_MODE: boolean = business.DEMO_MODE === true;

/** True for any "[CONFIRM ...]" placeholder value. */
export const isPlaceholder = (v: unknown): boolean =>
  typeof v === 'string' && /\[CONFIRM/i.test(v);

export const cityState = `${business.address.city}, ${business.address.state}`;
export const telHref = `tel:${business.phone.e164}`;

export const fullAddress = [
  business.address.street,
  business.address.city,
  `${business.address.state}${isPlaceholder(business.address.zip) ? '' : ' ' + business.address.zip}`,
].join(', ');

/** Prefix a root-relative path with the deploy base (e.g. /tree-service-demo). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || '/';
}

/** Absolute URL for canonical / OG tags. */
export function absUrl(path: string, site: URL | undefined): string {
  const origin = site ? site.origin : new URL(business.site.url).origin;
  return new URL(url(path), origin).toString();
}

/** Form endpoint: demo mode routes leads to the site builder, not the business. */
export const formEndpoint: string = DEMO_MODE ? business.demo.formEndpoint : business.form.endpoint;
export const formIsPlaceholder = /YOUR_[A-Z_]*FORM_ID/.test(formEndpoint);

export const services = business.services;
export const serviceArea = business.serviceArea;

export const areaSlug = (city: string) =>
  `tree-service-${slugify(city)}-${business.address.state.toLowerCase()}`;

export const ratingText = `${business.rating.value.toFixed(1)} stars from ${business.rating.count} ${business.rating.source} reviews`;

export const costGuideSlug = `tree-removal-cost-${slugify(business.address.city)}-${business.address.state.toLowerCase()}`;
export const costGuidePath = `/${costGuideSlug}/`;
export const serviceBySlug = (slug: string) => business.services.find((s) => s.slug === slug);
