export const sectionSlugs = Object.freeze({
  'la-carta': '',
  'tartes-nupcials': 'nupcials',
  'bufet-de-tortades': 'bufet',
  'taules-dolces': 'taules',
  contacte: 'contacte',
});

const rootDirectory = basePath => basePath.endsWith('/') ? basePath : `${basePath}/`;

export function sectionPath(sectionId, basePath) {
  const root = rootDirectory(basePath);
  const slug = sectionSlugs[sectionId] || '';
  return slug ? `${root}${slug}` : root.replace(/\/$/, '') || '/';
}

export function sectionFromLocation({ pathname, hash = '' }, basePath) {
  const legacyId = hash.slice(1);
  if (Object.hasOwn(sectionSlugs, legacyId)) return legacyId;

  const root = rootDirectory(basePath);
  const relativePath = pathname.startsWith(root) ? pathname.slice(root.length) : '';
  const slug = relativePath.replace(/\/?index\.html$/, '').replace(/\/+$/, '');
  return Object.entries(sectionSlugs).find(([, value]) => value === slug)?.[0] || 'la-carta';
}
