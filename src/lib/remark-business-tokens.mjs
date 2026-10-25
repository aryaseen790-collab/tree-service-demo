import { fillTokens } from './tokens.mjs';

// Replaces {{tokens}} in markdown text and prefixes root-relative links with
// the deploy base path (needed for GitHub Pages project sites).
export function remarkBusinessTokens({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  const walk = (node) => {
    if (node.type === 'text' || node.type === 'inlineCode') node.value = fillTokens(node.value);
    if (node.type === 'link' && typeof node.url === 'string') {
      node.url = fillTokens(node.url);
      if (node.url.startsWith('/') && !node.url.startsWith('//') && prefix) {
        node.url = prefix + node.url;
      }
    }
    if (node.children) node.children.forEach(walk);
  };
  return (tree) => walk(tree);
}
