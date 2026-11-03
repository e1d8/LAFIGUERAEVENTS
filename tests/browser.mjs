// Uses an installed Chrome, Node's native WebSocket, and the local preview server.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = (process.env.PREVIEW_URL || 'http://127.0.0.1:4173').replace(/\/+$/, '');
const basePath = new URL(`${base}/`).pathname;
const slugs = { 'la-carta': '', 'tartes-nupcials': 'nupcials', 'bufet-de-tortades': 'bufet', 'taules-dolces': 'taules', contacte: 'contacte' };
const titleNames = { 'la-carta': 'Inici', 'tartes-nupcials': 'Nupcials', 'bufet-de-tortades': 'Bufet', 'taules-dolces': 'Taules', contacte: 'Contacte' };
const pathFor = id => slugs[id] ? `${basePath}${slugs[id]}` : basePath.replace(/\/$/, '') || '/';
assert.equal((await fetch(base)).status, 200, 'Start npm run dev first');
if (['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) {
  for (const file of ['index.html', 'nupcials/index.html', 'styles.css', 'app.js', 'content.js']) {
    const response = await fetch(`${base}/${file}`, {
      headers: { 'If-Modified-Since': 'Wed, 01 Jan 2098 00:00:00 GMT', 'If-None-Match': '"old-preview"' },
    });
    assert.equal(response.status, 200, `Preview must serve the current ${file}, rather than a cached response`);
    assert.match(response.headers.get('cache-control') || '', /no-store/);
    assert.equal(await response.text(), await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));
  }
  console.log('✓ Previsualització sense memòria cau: HTML, estils i mòduls coincideixen amb els fitxers del disc');
}
const chromeBin = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = await mkdtemp(join(tmpdir(), 'figuera-browser-'));
const chrome = spawn(chromeBin, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let nextId = 0;
const pending = new Map();
const browserErrors = [];
const failedRequests = [];
const requestURLs = new Map();
const loadedDocuments = new Set();

try {
  let port;
  for (let i = 0; i < 120; i++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await sleep(100); }
  }
  assert.ok(port, 'Chrome did not start');
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const handler = pending.get(message.id);
      if (!handler) return;
      pending.delete(message.id);
      clearTimeout(handler.timeout);
      if (message.error) handler.reject(new Error(JSON.stringify(message.error))); else handler.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails);
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) failedRequests.push(message.params.response.url);
    if (message.method === 'Network.requestWillBeSent') requestURLs.set(message.params.requestId, message.params.request.url);
    if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
      failedRequests.push(`${requestURLs.get(message.params.requestId)} (${message.params.errorText})`);
    }
    if (message.method === 'Page.lifecycleEvent' && message.params.name === 'load') loadedDocuments.add(message.params.loaderId);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const until = async expression => {
    for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await sleep(50); }
    const images = await evaluate('Array.from(document.images).filter(image => !image.complete || !image.naturalWidth).map(image => ({src:image.src,complete:image.complete,visible:image.checkVisibility()}))');
    throw new Error(`Condition failed: ${expression}; pending images: ${JSON.stringify(images)}; failed requests: ${JSON.stringify(failedRequests)}`);
  };
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.enable');
  await send('Page.setLifecycleEventsEnabled', { enabled: true });
  const waitForDocument = async loaderId => {
    for (let i = 0; i < 120; i++) { if (loadedDocuments.has(loaderId)) return; await sleep(50); }
    throw new Error(`Document did not finish loading: ${loaderId}`);
  };
  const navigate = async url => {
    const result = await send('Page.navigate', { url });
    assert.ok(!result.errorText, result.errorText);
    if (result.loaderId) await waitForDocument(result.loaderId);
    await until('document.querySelectorAll(".panel").length === 5 && document.readyState === "complete"');
    await until('Array.from(document.querySelectorAll(".panel:not([hidden]) img, .site-header img")).every(image => image.complete && image.naturalWidth > 0)');
  };
  const reload = async () => {
    const previous = (await send('Page.getFrameTree')).frameTree.frame.loaderId;
    await send('Page.reload', { ignoreCache: true });
    for (let i = 0; i < 120; i++) {
      const loaderId = (await send('Page.getFrameTree')).frameTree.frame.loaderId;
      if (loaderId !== previous) { await waitForDocument(loaderId); await until('document.querySelectorAll(".panel").length === 5'); return; }
      await sleep(50);
    }
    throw new Error('Reload did not start a new document');
  };
  await mkdir('artifacts', { recursive: true });
  const routes = ['la-carta', 'tartes-nupcials', 'bufet-de-tortades', 'taules-dolces', 'contacte'];
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    let introReference;
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await navigate(`${base}/`);
    await evaluate('document.fonts.ready.then(() => true)');
    assert.ok(await evaluate(`document.fonts.check('400 16px "Futura Text"') && document.fonts.check('600 16px "Futura Text"')`));
    assert.ok(await evaluate(`getComputedStyle(document.body).fontFamily.includes('Futura Text') && getComputedStyle(document.body).fontWeight === '400'`));
    assert.ok(await evaluate(`document.fonts.check('500 26px "EB Garamond"') && document.fonts.check('700 10px Futura')`));
    assert.ok(await evaluate(`(() => {
      const name = getComputedStyle(document.querySelector('.brand-name'));
      const events = getComputedStyle(document.querySelector('.brand-name > span'));
      return name.fontFamily.includes('EB Garamond') && name.fontWeight === '500'
        && events.fontFamily.includes('Futura') && events.fontWeight === '700';
    })()`));
    assert.equal(await evaluate('document.querySelectorAll(".home-content img").length'), 4);
    assert.equal(await evaluate('document.querySelectorAll(".home-content .panel-heading").length'), 0);
    assert.ok(await evaluate('document.querySelector("#navigation").hidden && !document.querySelector("#navigation").checkVisibility()'));
    assert.ok(await evaluate(`(() => {
      const brand = document.querySelector('.brand').getBoundingClientRect();
      const greeting = document.querySelector('.home-content h1').getBoundingClientRect();
      const description = document.querySelector('.home-opening').getBoundingClientRect();
      const choices = document.querySelector('.home-choices').getBoundingClientRect();
      return brand.bottom <= greeting.top && greeting.bottom <= description.top && description.bottom <= choices.top;
    })()`));
    const homeLinks = await evaluate(`Array.from(document.querySelectorAll('.home-choice'), link => ({
      section: link.dataset.section, path: new URL(link.href).pathname,
      image: link.querySelector('img').getAttribute('src'), title: link.querySelector('.home-choice-title').textContent,
      markerColor: getComputedStyle(link.querySelector('.home-choice-title'), '::before').backgroundColor,
      imageAboveTitle: link.querySelector('img').getBoundingClientRect().bottom <= link.querySelector('.home-choice-title').getBoundingClientRect().top,
    }))`);
    assert.deepEqual(homeLinks.map(link => link.section), routes.slice(1));
    assert.deepEqual(homeLinks.map(link => link.path), routes.slice(1).map(pathFor));
    assert.deepEqual(homeLinks.map(link => link.title), ['Tartes nupcials', 'Bufet de tortades', 'Taules dolces', 'Contacte']);
    assert.deepEqual(homeLinks.map(link => link.image), ['./assets/nupcial-painted.png', './assets/torta-painted.png', './assets/galetes-painted.png', './assets/contacte-painted.png']);
    assert.ok(homeLinks.every(link => link.imageAboveTitle));
    assert.deepEqual(homeLinks.map(link => link.markerColor), ['rgb(204, 168, 197)', 'rgb(204, 168, 197)', 'rgb(204, 168, 197)', 'rgb(221, 193, 124)']);
    assert.ok(await evaluate(`(() => {
      const home = document.querySelector('.home-content');
      return home.querySelector('h1').textContent === 'Primer que res…ENHORABONA!'
        && getComputedStyle(home.querySelector('h1')).fontFamily.includes('Futura Text')
        && getComputedStyle(home.querySelector('h1')).fontWeight === '400'
        && getComputedStyle(home.querySelector('h1 strong')).fontWeight === '600'
        && !home.textContent.includes('LA FIGUERA EVENTS')
        && home.querySelector('.home-opening').textContent.length > 0;
    })()`));
    assert.equal(await evaluate('location.pathname'), pathFor('la-carta'));
    assert.equal(await evaluate('location.hash'), '');
    assert.equal(await evaluate('document.querySelectorAll(".nav-tab").length'), 4);
    assert.equal(await evaluate('new Set(Array.from(document.querySelectorAll(".nav-label"), label => getComputedStyle(label, "::before").clipPath)).size'), 4, 'Each navigation tab has a different marker stroke');
    assert.ok(await evaluate('Array.from(document.querySelectorAll(".nav-tab")).every(tab => getComputedStyle(tab).backgroundColor === "rgba(0, 0, 0, 0)" && getComputedStyle(tab.querySelector(".nav-label"), "::before").visibility === "hidden")'));
    assert.equal(await evaluate(`document.querySelectorAll('.nav-tab[data-section="la-carta"], .header-contact, .tab-number, .choice-top').length`), 0);
    assert.equal(await evaluate('document.querySelector(".brand").getAttribute("aria-current")'), 'page');
    assert.ok(await evaluate('!document.querySelector(".home-content").textContent.includes("Al final d’aquest document")'));
    assert.ok(await evaluate('!document.querySelector(".home-content").textContent.includes("Si teniu qualsevol dubte")'));
    assert.ok(await evaluate('!document.querySelector(".home-content").textContent.includes("Veure la carta")'));
    assert.equal(await evaluate('document.querySelectorAll(".home-content a[data-section]").length'), 4);
    const underlineVariants = await evaluate('Array.from(document.querySelectorAll(".product-name-text")).map(name => name.dataset.underline)');
    assert.equal(new Set(underlineVariants.slice(0, 4)).size, 4, 'Use all four fixed strokes before reshuffling');
    assert.ok(underlineVariants.every((variant, index) => /^[0-3]$/.test(variant) && (!index || variant !== underlineVariants[index - 1])));
    assert.ok(await evaluate('document.querySelector("link[rel=icon]").href.endsWith("/favicon.png")'));
    assert.ok(await evaluate('document.querySelector(".brand-logo").src.endsWith("/figa-256.png") && document.querySelector(".brand-logo").complete && document.querySelector(".brand-logo").naturalWidth === 256'));
    for (const route of routes) {
      await evaluate(`document.querySelector('${route === 'la-carta' ? '.brand' : route === 'tartes-nupcials' ? `.home-choice[data-section="${route}"] img` : `.nav-tab[data-section="${route}"]`}').click()`);
      await until(`document.querySelector('#panel-${route}').hidden === false`);
      await until('Array.from(document.querySelectorAll(".panel:not([hidden]) img")).every(image => image.complete && image.naturalWidth > 0)');
      assert.equal(await evaluate('location.pathname'), pathFor(route));
      assert.equal(await evaluate('document.title'), `La Figuera Events · ${titleNames[route]}`);
      assert.equal(await evaluate('location.hash'), '');
      assert.equal(await evaluate('document.querySelectorAll(".panel:not([hidden])").length'), 1);
      assert.equal(await evaluate('document.querySelectorAll(".panel details[open]").length'), 0, 'Changing section collapses FAQ');
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Page overflow: ${width}/${route}`);
      assert.equal(await evaluate('scrollY'), 0, 'Changing sections returns to the top');
      assert.equal(await evaluate('document.querySelector("#navigation").checkVisibility()'), route !== 'la-carta');
      if (route !== 'la-carta') {
        assert.ok(await evaluate(`(() => {const tab = document.querySelector('.nav-tab.active'); const marker = getComputedStyle(tab.querySelector('.nav-label'), '::before'); return getComputedStyle(tab).backgroundColor === 'rgba(0, 0, 0, 0)' && marker.visibility === 'visible' && marker.backgroundColor === 'rgb(221, 193, 124)';})()`), 'Selected navigation shows a yellow underline without a box');
      }
      if (route !== 'la-carta' && route !== 'contacte') {
        assert.ok(await evaluate(`(() => {const lead=document.querySelector('#panel-${route} .section-lead');const image=lead.querySelector('.section-illustration');const picture=image.getBoundingClientRect();const title=lead.querySelector('h1').getBoundingClientRect();return image.complete && image.naturalWidth>0 && !image.src.endsWith('flower.svg') && picture.width>=200 && (picture.left>=title.right || picture.top>=title.bottom)})()`));
        const introMetrics = await evaluate(`(() => {
          const lead = document.querySelector('#panel-${route} .section-lead');
          const metrics = (selector, includeHeight) => {
            const node = lead.querySelector(selector);
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return {
              left: rect.left, top: rect.top, width: rect.width,
              ...(includeHeight ? {height: rect.height} : {}),
              font: style.fontFamily, size: style.fontSize, weight: style.fontWeight, lineHeight: style.lineHeight,
            };
          };
          return { title: metrics('h1', true), text: metrics('.section-intro', false), image: metrics('.section-illustration', true) };
        })()`);
        introReference ||= introMetrics;
        assert.deepEqual(introMetrics, introReference, `Intro layout and typography must match across sections: ${width}/${route}`);
      }
      assert.ok(await evaluate('Array.from(document.querySelectorAll(".nav-tab")).every(x => {const r=x.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth})'));
      assert.equal(await evaluate('document.querySelectorAll("table, .table-scroll, .scroll-hint").length'), 0);
      if (['tartes-nupcials', 'bufet-de-tortades', 'taules-dolces'].includes(route)) {
        const panel = `#panel-${route}`;
        assert.equal(await evaluate(`document.querySelectorAll('${panel} details.product-item, ${panel} .product-summary, ${panel} .product-toggle').length`), 0);
        assert.ok(await evaluate(`(() => {
          const names = Array.from(document.querySelectorAll('${panel} .product-name-text'));
          return names.every(name => /^[0-3]$/.test(name.dataset.underline)
            && getComputedStyle(name, '::before').clipPath !== 'none');
        })()`));
        assert.ok(await evaluate(`(async () => {
          const {tables, sections, pickup} = await import('./content.js');
          const section = sections.find(section => section.id === '${route}');
          return section.tableIds.every(id => {
            const data = tables[id];
            const block = document.querySelector('${panel} [data-catalogue-id="' + id + '"]');
            if (block.querySelector('.catalogue-heading').textContent !== data.title
              || block.querySelector('.pickup-note').textContent !== pickup) return false;
            if (data.fragments?.some(fragment => !block.querySelector('.source-fragments').textContent.includes(fragment.text)
              || !block.querySelector('.source-fragments').textContent.includes(fragment.note))) return false;
            return data.rows.every(row => {
              const item = block.querySelector('[data-row-id="' + row.id + '"]');
              if (!item.checkVisibility() || !item.querySelector('.product-details').checkVisibility()) return false;
              if (row.note && item.querySelector('.product-note')?.textContent !== row.note) return false;
              if (!data.columns.some(column => column.role === 'name')
                && item.querySelector('.product-name').textContent !== data.title) return false;
              return data.columns.every(column => {
                const field = item.querySelector('[data-column-key="' + column.key + '"]');
                const value = row.cells[column.key];
                const label = column.role === 'name' ? item.querySelector('.visually-hidden') : field;
                return field.textContent.includes(value.text)
                  && (column.role === 'detail' || label.textContent.includes(column.label.text))
                  && (!value.pending || field.textContent.includes('Informació pendent'))
                  && (column.role === 'detail' || !column.label.pending || field.querySelector('.product-option-label .pending-badge'))
                  && field.checkVisibility();
              });
            });
          });
        })()`), `Content or visibility mismatch: ${width}/${route}`);
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('${panel} .product-item')).every(item => {
          const name = item.querySelector('.product-name').getBoundingClientRect();
          const description = item.querySelector('.product-details').getBoundingClientRect();
          const options = item.querySelector('.product-options').getBoundingClientRect();
          return item.scrollWidth <= item.clientWidth + 1
            && description.top >= name.bottom && options.top >= description.bottom
            && getComputedStyle(item).backgroundColor === 'rgb(249, 249, 243)';
        })`));
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
        if (width === 390 || width === 1440) {
          await evaluate(`document.querySelector('${panel} .catalogue-block').scrollIntoView({block:'start'})`);
          const { data } = await send('Page.captureScreenshot', { format: 'png' });
          await writeFile(`artifacts/${route}-catalogue-${width}.png`, Buffer.from(data, 'base64'));
        }
        await evaluate('window.scrollTo(0,0)');
      }
      if (route === 'tartes-nupcials') {
        assert.ok(await evaluate(`(() => {
          const normal = getComputedStyle(document.querySelector('#panel-tartes-nupcials .section-intro'));
          const bold = getComputedStyle(document.querySelector('#panel-tartes-nupcials .section-intro strong'));
          return normal.fontFamily.includes('Futura Text') && normal.fontWeight === '400'
            && bold.fontFamily.includes('Futura Text') && bold.fontWeight === '600';
        })()`));
        assert.ok(await evaluate('Array.from(document.querySelectorAll(".arrow-image")).every(img => img.complete && img.naturalWidth > 0)'));
        assert.equal(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item[open]").length'), 0);
        await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item summary")[0].click()');
        await until('document.querySelectorAll("#panel-tartes-nupcials .faq-item[open]").length === 1');
        await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item summary")[1].click()');
        await sleep(100);
        assert.equal(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item[open]").length'), 1);
        assert.equal(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item")[0].open'), false);
        assert.ok(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item")[1].innerText.includes("Informació pendent")'));
      }
      if (route === 'contacte') {
        assert.equal(await evaluate('document.querySelectorAll("#panel-contacte .section-lead img").length'), 0, 'Contact introduction has no illustration');
        assert.equal(await evaluate('document.querySelectorAll("#panel-contacte .contact-row").length'), 3);
        assert.ok(await evaluate('Array.from(document.querySelectorAll(".contact-illustration")).every(img => img.complete && img.naturalWidth > 0)'));
        assert.deepEqual(await evaluate('Array.from(document.querySelectorAll(".contact-illustration"), image => image.getAttribute("src"))'), ['./assets/contact-whatsapp-painted.png', './assets/contacte-painted.png', './assets/contact-instagram-painted.png']);
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('.contact-row')).every(row => {
          const link = row.querySelector('a');
          const image = row.querySelector('img');
          const bounds = link.getBoundingClientRect();
          return row.querySelectorAll('a').length === 1 && image.closest('a') === link
            && row.querySelector('.contact-label').closest('a') === link
            && row.querySelector('.contact-value').closest('a') === link
            && bounds.width === row.clientWidth && bounds.height === row.clientHeight
            && image.getBoundingClientRect().right < row.querySelector('.contact-details').getBoundingClientRect().left;
        })`));
      }
      assert.ok(await evaluate('Array.from(document.querySelectorAll(".faq-heading")).every(heading => heading.textContent === "Preguntes freqüents")'));
      if (width === 390 || width === 1440) {
        await evaluate('window.scrollTo(0,0)');
        const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        await writeFile(`artifacts/${route}-${width}.png`, Buffer.from(data, 'base64'));
      }
      if (['tartes-nupcials', 'bufet-de-tortades', 'taules-dolces'].includes(route)) {
        await evaluate(`document.querySelector('#panel-${route} .faq-item summary').click()`);
        await until(`document.querySelectorAll('#panel-${route} details[open]').length === 1`);
        await evaluate(`document.querySelector('.nav-tab[data-section="${route}"]').click()`);
        assert.equal(await evaluate(`document.querySelectorAll('#panel-${route} details[open]').length`), 1, 'Selecting the current section keeps its FAQ open');
      }
    }
    await evaluate('document.querySelector(".brand-logo").click()');
    await until('document.querySelector("#panel-la-carta").hidden === false');
    for (const route of routes.slice(1)) {
      assert.ok(await evaluate('!document.querySelector("#navigation").checkVisibility()'));
      await evaluate(`document.querySelector('.home-choice[data-section="${route}"] .home-choice-title').click()`);
      await until(`document.querySelector('#panel-${route}').hidden === false`);
      assert.ok(await evaluate('document.querySelector("#navigation").checkVisibility()'));
      await evaluate('document.querySelector(".brand-name").click()');
      await until('document.querySelector("#panel-la-carta").hidden === false');
    }
    console.log(`✓ ${width}px: portada amb quatre accessos il·lustrats, navegació contextual i catàlegs sense desbordament`);
  }
  await evaluate(`document.querySelector('.home-choice[data-section="tartes-nupcials"]').click()`);
  for (let index = 0; index < 4; index++) {
    const point = await evaluate(`(() => { const rect = document.querySelectorAll('.nav-tab')[${index}].getBoundingClientRect(); return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2}; })()`);
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...point});
    const expectedColor = index === 0 ? 'rgb(221, 193, 124)' : 'rgb(204, 168, 197)';
    assert.ok(await evaluate(`(() => { const marker = getComputedStyle(document.querySelectorAll('.nav-label')[${index}], '::before'); return marker.visibility === 'visible' && marker.backgroundColor === '${expectedColor}'; })()`), 'Hover shows a pink underline and the selected tab stays yellow');
  }
  await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 0, y: 0});
  await evaluate('history.back()');
  await until('document.querySelector("#panel-la-carta").hidden === false');
  assert.ok(await evaluate('!document.querySelector("#navigation").checkVisibility()'));
  await evaluate('history.forward()');
  await until('document.querySelector("#panel-tartes-nupcials").hidden === false');
  assert.ok(await evaluate('document.querySelector("#navigation").checkVisibility()'));
  for (const width of [768, 930, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
  }
  console.log('✓ Catàleg adaptable també en redimensionar sense recarregar');
  const hrefs = await evaluate('Array.from(document.querySelectorAll("#panel-contacte a")).map(a=>a.getAttribute("href"))');
  assert.deepEqual(hrefs, ['https://wa.me/34649656652', 'mailto:lafigueravlc@gmail.com', 'https://www.instagram.com/lafigueravlc/']);
  for (const route of routes) {
    const entry = `${base}/${slugs[route]}`;
    const response = await fetch(entry);
    assert.equal(response.status, 200, `Static page missing: ${entry}`);
    assert.ok(response.headers.get('content-type').includes('text/html'));
    await navigate(entry);
    await until(`document.querySelector('#panel-${route}').hidden === false`);
    assert.equal(await evaluate('location.pathname'), pathFor(route));
    assert.equal(await evaluate('document.title'), `La Figuera Events · ${titleNames[route]}`);
    assert.equal(await evaluate('location.hash'), '');
    await reload();
    assert.equal(await evaluate('location.pathname'), pathFor(route));
    assert.equal(await evaluate(`document.querySelector('#panel-${route}').hidden`), false);
    assert.equal(await evaluate('document.title'), `La Figuera Events · ${titleNames[route]}`);
    if (slugs[route]) {
      for (const ending of ['/', '/index.html']) {
        await navigate(entry + ending);
        assert.equal(await evaluate('location.pathname'), pathFor(route));
        assert.equal(await evaluate(`document.querySelector('#panel-${route}').hidden`), false);
      }
    }
    await navigate(`${base}/#${route}`);
    await until(`location.pathname === ${JSON.stringify(pathFor(route))} && location.hash === ''`);
    assert.equal(await evaluate(`document.querySelector('#panel-${route}').hidden`), false);
  }
  await navigate(`${base}/taules`);
  await until('document.querySelector("#panel-taules-dolces")?.hidden === false');
  assert.equal(await evaluate('document.querySelector(".nav-tab.active").dataset.section'), 'taules-dolces');
  await evaluate('document.querySelector("#panel-taules-dolces .faq-item summary").click()');
  await until('document.querySelectorAll(".panel details[open]").length === 1');
  await evaluate(`document.querySelector('.nav-tab[data-section="bufet-de-tortades"]').click()`);
  await until('document.querySelector("#panel-bufet-de-tortades").hidden === false');
  assert.equal(await evaluate('document.querySelectorAll(".panel details[open]").length'), 0);
  await evaluate('document.querySelector("#panel-bufet-de-tortades .faq-item summary").click()');
  await until('document.querySelectorAll(".panel details[open]").length === 1');
  await evaluate('history.back()');
  await until('document.querySelector("#panel-taules-dolces").hidden === false');
  assert.equal(await evaluate('document.querySelectorAll(".panel details[open]").length'), 0);
  await evaluate('document.querySelector("#panel-taules-dolces .faq-item summary").click()');
  await until('document.querySelectorAll(".panel details[open]").length === 1');
  await evaluate('history.forward()');
  await until('document.querySelector("#panel-bufet-de-tortades").hidden === false');
  assert.equal(await evaluate('document.querySelectorAll(".panel details[open]").length'), 0);
  assert.equal(await evaluate('location.pathname'), pathFor('bufet-de-tortades'));
  await navigate(`${base}/#unknown`);
  await until('document.querySelector("#panel-la-carta")?.hidden === false');
  assert.equal(await evaluate('location.hash'), '');
  assert.equal(await evaluate('location.pathname'), pathFor('la-carta'));
  for (const width of [320, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    const extended = await evaluate(`(async () => {
    const {renderCatalogue}=await import('./app.js');
    const {tables}=await import('./content.js');
    const data=structuredClone(tables.cookies);
    data.columns.push({key:'extra',label:{text:'Nova columna',pending:false}});
    data.columns.push({key:'known',label:{text:'Altra opció',pending:false}});
    data.rows[0].cells.known={text:'99€ (sense IVA)',pending:false};
    const wrap=renderCatalogue(data); document.querySelector('#panel-la-carta').append(wrap);
    const extra=wrap.querySelector('[data-column-key="extra"]');
    const result={options:wrap.querySelectorAll('.product-option').length,pending:extra.querySelector('.product-option-value').textContent,label:extra.querySelector('.product-option-label').textContent,visible:extra.checkVisibility(),known:wrap.querySelector('[data-column-key="known"] .product-option-value').textContent,overflow:document.documentElement.scrollWidth>innerWidth};
    data.rows = Array.from({length:20}, (_, index) => ({...data.rows[0], id:'stroke-' + index}));
    const variants = Array.from(renderCatalogue(data).querySelectorAll('.product-name-text')).map(name => name.dataset.underline);
    result.allStrokes = new Set(variants).size === 4;
    result.noRepeats = variants.every((variant, index) => /^[0-3]$/.test(variant) && (!index || variant !== variants[index - 1]));
    wrap.remove();return result;
  })()`);
    assert.deepEqual(extended, { options: 4, pending: 'Informació pendent', label: 'Nova columna', visible: true, known: '99€ (sense IVA)', overflow: false, allStrokes: true, noRepeats: true });
  }
  assert.ok(await evaluate(`document.fonts.check('500 20px "EB Garamond"') && document.fonts.check('400 20px "Futura Text"') && document.fonts.check('600 20px "Futura Text"')`));
  assert.deepEqual(browserErrors, [], 'Browser runtime errors');
  assert.deepEqual(failedRequests, [], 'Failed assets');
  console.log('✓ Rutes sense #, càrrega directa, recàrrega, enllaços antics, arrere/avant i columna addicional');
  console.log('✓ Sense errors JavaScript ni recursos absents; captures en artifacts/');
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
  await sleep(700);
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
