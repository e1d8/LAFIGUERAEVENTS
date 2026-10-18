import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sectionSlugs, sectionPath, sectionFromLocation } from '../routes.js';

test('Section paths match the requested public URLs', () => {
  assert.deepEqual(sectionSlugs, { 'la-carta': '', 'tartes-nupcials': 'nupcials', 'bufet-de-tortades': 'bufet', 'taules-dolces': 'taules', contacte: 'contacte' });
});

for (const basePath of ['/', '/LAFIGUERAEVENTS/']) {
  test(`Clean paths and direct page entries under ${basePath}`, () => {
    for (const [id, slug] of Object.entries(sectionSlugs)) {
      const path = sectionPath(id, basePath);
      assert.ok(!path.includes('#'));
      if (path !== '/') assert.ok(!path.endsWith('/'));
      assert.equal(sectionFromLocation({ pathname: path }, basePath), id);
      assert.equal(sectionFromLocation({ pathname: `${basePath}${slug}${slug ? '/' : ''}` }, basePath), id);
      assert.equal(sectionFromLocation({ pathname: `${basePath}${slug ? `${slug}/` : ''}index.html` }, basePath), id);
      assert.equal(sectionFromLocation({ pathname: basePath, hash: `#${id}` }, basePath), id);
    }
    assert.equal(sectionFromLocation({ pathname: basePath, hash: '#unknown' }, basePath), 'la-carta');
    assert.equal(sectionFromLocation({ pathname: `${basePath}bufet`, hash: '#unknown' }, basePath), 'bufet-de-tortades');
  });
}

test('Direct entry pages share the root HTML and load assets from the parent directory', async () => {
  const root = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const normalize = html => html.replace(/<base href="[^"]+">/, '<base>').replace(/<title>[^<]+<\/title>/, '<title>');
  for (const slug of Object.values(sectionSlugs).filter(Boolean)) {
    const html = await readFile(new URL(`../${slug}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /<base href="\.\.\/">/);
    assert.equal(normalize(html), normalize(root));
  }
});
