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
  assert.match(root, /<title>La Figuera Events<\/title>/);
  const normalize = html => html.replace(/<base href="[^"]+">/, '<base>')
    .replace(/<title>[^<]+<\/title>/, '<title>')
    .replace(/<meta property="og:url" content="[^"]+">/, '<meta property="og:url">');
  for (const slug of Object.values(sectionSlugs).filter(Boolean)) {
    const html = await readFile(new URL(`../${slug}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /<base href="\.\.\/">/);
    assert.ok(html.includes(`<title>La Figuera Events · ${slug[0].toUpperCase() + slug.slice(1)}</title>`));
    assert.equal(normalize(html), normalize(root));
  }
});

test('Every static entry provides the requested link-sharing title and description without JavaScript', async () => {
  const imageURL = 'https://e1d8.github.io/LAFIGUERAEVENTS/assets/share-banner.png?v=2';
  const image = await readFile(new URL('../assets/share-banner.png', import.meta.url));
  assert.ok(image.length < 600_000, 'The preview image must stay below WhatsApp’s 600 KB limit');
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  for (const [id, slug] of Object.entries(sectionSlugs)) {
    const html = await readFile(new URL(`../${slug ? `${slug}/` : ''}index.html`, import.meta.url), 'utf8');
    const pageURL = `https://e1d8.github.io${sectionPath(id, '/LAFIGUERAEVENTS/')}`;
    assert.equal((html.match(/property="og:url"/g) || []).length, 1);
    assert.ok(html.includes(`<meta property="og:url" content="${pageURL}">`));
    for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
      assert.ok(html.includes(`<meta ${attribute} content="Tartes nupcials, bufet de tortades i taules dolces">`));
    }
    for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
      assert.ok(html.includes(`<meta ${attribute} content="La Figuera Events">`));
    }
    for (const attribute of ['property="og:image"', 'name="twitter:image"']) {
      assert.ok(html.includes(`<meta ${attribute} content="${imageURL}">`));
    }
    for (const attribute of ['property="og:image:alt"', 'name="twitter:image:alt"']) {
      assert.ok(html.includes(`<meta ${attribute} content="La figuera · Cookies &amp; Cheesecakes, sobre un fons lila amb figues">`));
    }
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
    assert.ok(html.includes('<meta property="og:image:width" content="1200">'));
    assert.ok(html.includes('<meta property="og:image:height" content="630">'));
  }
});
