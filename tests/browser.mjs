// Uses an installed Chrome, Node's native WebSocket, and the local preview server.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = (process.env.PREVIEW_URL || 'http://127.0.0.1:4173').replace(/\/+$/, '');
const basePath = new URL(`${base}/`).pathname;
const slugs = { 'la-carta': '', 'tartes-nupcials': 'nupcials', 'bufet-de-tortades': 'bufet', 'taules-dolces': 'taules', contacte: 'contacte' };
const pathFor = id => slugs[id] ? `${basePath}${slugs[id]}` : basePath.replace(/\/$/, '') || '/';
assert.equal((await fetch(base)).status, 200, 'Start npm run dev first');
const chromeBin = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = await mkdtemp(join(tmpdir(), 'figuera-browser-'));
const chrome = spawn(chromeBin, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let nextId = 0;
const pending = new Map();
const browserErrors = [];
const failedRequests = [];
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
    throw new Error(`Condition failed: ${expression}`);
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
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await navigate(`${base}/`);
    await evaluate('document.fonts.ready.then(() => true)');
    assert.equal(await evaluate('location.pathname'), pathFor('la-carta'));
    assert.equal(await evaluate('location.hash'), '');
    assert.equal(await evaluate('document.querySelectorAll(".nav-tab").length'), 4);
    assert.equal(await evaluate(`document.querySelectorAll('.nav-tab[data-section="la-carta"], .header-contact, .tab-number, .choice-top').length`), 0);
    assert.equal(await evaluate('document.querySelector(".brand").getAttribute("aria-current")'), 'page');
    assert.ok(await evaluate('!document.querySelector(".home-content").textContent.includes("Al final d’aquest document")'));
    assert.ok(await evaluate('!document.querySelector(".home-content").textContent.includes("Si teniu qualsevol dubte")'));
    assert.ok(await evaluate('!document.querySelector(".home-content").textContent.includes("Veure la carta")'));
    assert.equal(await evaluate('document.querySelectorAll(".choice-label .choice-arrow").length'), 3);
    assert.ok(await evaluate('Array.from(document.querySelectorAll(".choice-card")).every(card => {const title=card.querySelector("h2");const range=document.createRange();range.selectNodeContents(title);return range.getClientRects().length === 1 && card.querySelector(".choice-arrow").getBoundingClientRect().right <= card.getBoundingClientRect().right-parseFloat(getComputedStyle(card).paddingRight)+1})'));
    assert.ok(await evaluate('document.querySelector("link[rel=icon]").href.endsWith("/fig.svg")'));
    assert.ok(await evaluate('Array.from(document.querySelectorAll(".choice-illustration")).length === 3 && Array.from(document.querySelectorAll(".choice-illustration")).every(img => img.complete && img.naturalWidth > 0 && !img.src.endsWith("flower.svg"))'));
    for (const route of routes) {
      await evaluate(`document.querySelector('${route === 'la-carta' ? '.brand' : `.nav-tab[data-section="${route}"]`}').click()`);
      await until(`document.querySelector('#panel-${route}').hidden === false`);
      assert.equal(await evaluate('location.pathname'), pathFor(route));
      assert.equal(await evaluate('location.hash'), '');
      assert.equal(await evaluate('document.querySelectorAll(".panel:not([hidden])").length'), 1);
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Page overflow: ${width}/${route}`);
      assert.equal(await evaluate('scrollY'), 0, 'Changing sections returns to the top');
      if (route !== 'la-carta') {
        assert.ok(await evaluate(`(() => {const lead=document.querySelector('#panel-${route} .section-lead');const image=lead.querySelector('.section-illustration');const picture=image.getBoundingClientRect();const title=lead.querySelector('h1').getBoundingClientRect();return image.complete && image.naturalWidth>0 && !image.src.endsWith('flower.svg') && picture.width>=200 && (picture.left>=title.right || picture.top>=title.bottom)})()`));
      }
      assert.ok(await evaluate('Array.from(document.querySelectorAll(".nav-tab")).every(x => {const r=x.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth})'));
      await until(`Array.from(document.querySelectorAll('.panel:not([hidden]) .table-block')).every(block => {
        const scroll = block.querySelector('.table-scroll');
        return block.querySelector('.scroll-hint').hidden === (scroll.scrollWidth <= scroll.clientWidth + 1);
      })`);
      assert.ok(await evaluate(`Array.from(document.querySelectorAll('.panel:not([hidden]) table')).every(table => {
        const cells = table.querySelectorAll('thead th');
        return cells[0].getBoundingClientRect().width < cells[1].getBoundingClientRect().width;
      })`));
      if (route === 'tartes-nupcials') {
        assert.equal(await evaluate('document.querySelector(".scroll-hint").textContent.trim()'), 'per a vore més columnes');
        assert.ok(await evaluate('Array.from(document.querySelectorAll(".arrow-image")).every(img => img.complete && img.naturalWidth > 0)'));
        assert.equal(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item[open]").length'), 0);
        await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item summary")[0].click()');
        await until('document.querySelectorAll("#panel-tartes-nupcials .faq-item[open]").length === 1');
        await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item summary")[1].click()');
        await sleep(100);
        assert.equal(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item[open]").length'), 1);
        assert.equal(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item")[0].open'), false);
        assert.ok(await evaluate('document.querySelectorAll("#panel-tartes-nupcials .faq-item")[1].innerText.includes("Informació pendent")'));
        if (width === 360 || width === 390) {
          assert.ok(await evaluate('document.querySelector("#panel-tartes-nupcials .table-scroll").scrollWidth > document.querySelector("#panel-tartes-nupcials .table-scroll").clientWidth'));
          assert.ok(await evaluate(`(() => {const t=document.querySelector('#panel-tartes-nupcials .table-scroll');const c=t.querySelector('tbody th');const x=c.getBoundingClientRect().left;t.scrollLeft=160;return Math.abs(c.getBoundingClientRect().left-x)<2})()`));
        }
      }
      if (route === 'contacte') {
        assert.equal(await evaluate('document.querySelectorAll("#panel-contacte .contact-row").length'), 3);
        assert.ok(await evaluate('Array.from(document.querySelectorAll(".contact-illustration")).every(img => img.complete && img.naturalWidth > 0)'));
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
      if ((width === 390 || width === 1440) && ['la-carta', 'tartes-nupcials', 'contacte'].includes(route)) {
        await evaluate('window.scrollTo(0,0)');
        const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        await writeFile(`artifacts/${route}-${width}.png`, Buffer.from(data, 'base64'));
      }
    }
    await evaluate('document.querySelector(".brand-logo").click()');
    await until('document.querySelector("#panel-la-carta").hidden === false');
    for (const route of routes.slice(1, 4)) {
      await evaluate(`document.querySelector('.choice-card[data-section="${route}"]').click()`);
      await until(`document.querySelector('#panel-${route}').hidden === false`);
      await evaluate('document.querySelector(".brand-name").click()');
      await until('document.querySelector("#panel-la-carta").hidden === false');
    }
    console.log(`✓ ${width}px: 5 seccions, sense desbordament, acordió i taules`);
  }
  await evaluate(`document.querySelector('.nav-tab[data-section="tartes-nupcials"]').click()`);
  for (const width of [768, 930, 768, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await until(`document.querySelector('#panel-tartes-nupcials .scroll-hint').hidden === ${width >= 930}`);
  }
  console.log('✓ Avís de columnes segons el desbordament real, també en redimensionar sense recarregar');
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
    assert.equal(await evaluate('location.hash'), '');
    await reload();
    assert.equal(await evaluate('location.pathname'), pathFor(route));
    assert.equal(await evaluate(`document.querySelector('#panel-${route}').hidden`), false);
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
  await evaluate(`document.querySelector('.nav-tab[data-section="bufet-de-tortades"]').click()`);
  await until('document.querySelector("#panel-bufet-de-tortades").hidden === false');
  await evaluate('history.back()');
  await until('document.querySelector("#panel-taules-dolces").hidden === false');
  await evaluate('history.forward()');
  await until('document.querySelector("#panel-bufet-de-tortades").hidden === false');
  assert.equal(await evaluate('location.pathname'), pathFor('bufet-de-tortades'));
  await navigate(`${base}/#unknown`);
  await until('document.querySelector("#panel-la-carta")?.hidden === false');
  assert.equal(await evaluate('location.hash'), '');
  assert.equal(await evaluate('location.pathname'), pathFor('la-carta'));
  const extended = await evaluate(`(async () => {
    const {renderTable}=await import('./app.js');
    const {tables}=await import('./content.js');
    const data=structuredClone(tables.cookies);
    data.columns.push({key:'extra',label:{text:'Nova columna',pending:false}});
    const wrap=renderTable(data); document.querySelector('#panel-la-carta').append(wrap);
    const result={headings:wrap.querySelectorAll('thead th').length,cells:wrap.querySelectorAll('tbody tr:first-child>*').length,pending:wrap.querySelector('tbody tr>*:last-child').textContent};
    wrap.remove();return result;
  })()`);
  assert.deepEqual(extended, { headings: 4, cells: 4, pending: 'Informació pendent' });
  assert.ok(await evaluate('document.fonts.check("20px Titan") && document.fonts.check("20px DM Sans")'));
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
