import { fillTokens, tokens } from './tokens.mjs';

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Wrap "[CONFIRM ...]" placeholders in a highlighted span (see .confirm in global.css).
function highlightPlaceholders(node) {
  if (node.type !== 'text' || !/\[CONFIRM/i.test(node.value)) return [node];
  return node.value.split(/(\[CONFIRM[^\]]*\])/i).filter(Boolean).map((part) =>
    /^\[CONFIRM/i.test(part)
      ? { type: 'html', value: `<span class="confirm">${escape(part)}</span>` }
      : { type: 'text', value: part },
  );
}

// Replaces {{tokens}} in markdown text, prefixes root-relative links with the
// deploy base path (needed for GitHub Pages project sites), and expands
// <!-- CTA --> into a call-to-action box so long pages keep a CTA in reach.
export function remarkBusinessTokens({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  const cta = `<aside class="cta-inline not-prose" aria-label="Get a free quote">
<p class="cta-inline-title">Want a straight answer on your tree?</p>
<p>Free estimates and same-day response from a local ${tokens.city} crew.</p>
<div class="cta-inline-actions"><a class="btn-accent" href="${tokens.phoneHref}">Call ${tokens.phone}</a><a class="btn-outline" href="${prefix}/contact/#quote">Get a Free Quote</a></div>
</aside>`;
  const walk = (node) => {
    if (node.type === 'text' || node.type === 'inlineCode') node.value = fillTokens(node.value);
    if (node.type === 'html') node.value = node.value.trim() === '<!-- CTA -->' ? cta : fillTokens(node.value);
    if (node.type === 'link' && typeof node.url === 'string') {
      node.url = fillTokens(node.url);
      if (node.url.startsWith('/') && !node.url.startsWith('//') && prefix) node.url = prefix + node.url;
    }
    if (node.children) {
      node.children.forEach(walk);
      node.children = node.children.flatMap(highlightPlaceholders);
    }
  };
  return (tree) => walk(tree);
}
