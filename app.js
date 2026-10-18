import { sections, tables, pickup, introduction, contact } from './content.js';
import { sectionPath, sectionFromLocation } from './routes.js';

// Anchor resources to app.js, even when the visible URL has no trailing slash.
const appRoot = new URL('./', import.meta.url);
const resourceBase = document.querySelector('base') || document.head.insertBefore(document.createElement('base'), document.head.firstChild);
resourceBase.href = appRoot.href;
const routePath = sectionId => sectionPath(sectionId, appRoot.pathname);
document.querySelector('.brand').href = routePath('la-carta');

const main = document.querySelector('#main');
const navigation = document.querySelector('#navigation');
const sectionImages = {
  'tartes-nupcials': 'wedding-cake.svg',
  'bufet-de-tortades': 'buffet.svg',
  'taules-dolces': 'sweet-table.svg',
  contacte: 'contact.svg',
};
const el = (tag, className = '', text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const emphasis = [
  '100% artesanals', 'proximitat i de temporada', 'flors i fruita fresca',
  'NO AGAFEM MÉS D’UN EVENT PER DATA', 'formatge blau', 'parmesà', 'raïm',
  'café d’especialitat', 'xocolate 85%', 'crema de pistatxo casolana',
];
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const richPattern = new RegExp(`(${[contact.email, contact.handle, contact.phone, ...emphasis].map(escapeRegex).join('|')}|\\d+(?:[,.]\\d+)?€)`, 'g');

function richText(parent, text) {
  text.split(richPattern).forEach(part => {
    if (part === contact.email || part === contact.handle || part === contact.phone) {
      const link = el('a', '', part);
      link.href = part === contact.email ? `mailto:${part}` : part === contact.phone ? `tel:+34${part}` : 'https://www.instagram.com/lafigueravlc/';
      parent.append(link);
    } else if (emphasis.includes(part) || /^\d+(?:[,.]\d+)?€$/.test(part)) {
      parent.append(el('strong', part.endsWith('€') ? 'amount' : '', part));
    } else {
      parent.append(document.createTextNode(part));
    }
  });
}

function paragraph(text, className = '') {
  const p = el('p', className);
  richText(p, text);
  return p;
}

function pendingBadge() { return el('span', 'pending-badge', 'Informació pendent'); }

function renderCell(parent, value) {
  if (value?.text) richText(parent, value.text);
  if (!value || value.pending) parent.append(pendingBadge());
}

// Adding a key to columns is sufficient: missing cells receive an explicit pending badge.
export function renderTable(data) {
  const wrap = el('div', 'table-scroll');
  wrap.tabIndex = 0;
  wrap.setAttribute('aria-label', `${data.title}. Taula amb desplaçament horitzontal`);
  const table = el('table');
  table.style.setProperty('--column-count', data.columns.length);
  const caption = el('caption', 'visually-hidden', data.title);
  table.append(caption);
  const head = el('thead');
  const headings = el('tr');
  data.columns.forEach(column => {
    const th = el('th');
    th.scope = 'col';
    renderCell(th, column.label);
    headings.append(th);
  });
  head.append(headings);
  table.append(head);
  const body = el('tbody');
  data.rows.forEach(row => {
    const tr = el('tr');
    tr.dataset.rowId = row.id;
    data.columns.forEach((column, index) => {
      const td = el(index === 0 ? 'th' : 'td');
      if (index === 0) td.scope = 'row';
      renderCell(td, row.cells[column.key]);
      tr.append(td);
    });
    body.append(tr);
  });
  table.append(body);
  wrap.append(table);
  return wrap;
}

function tableBlock(id) {
  const data = tables[id];
  const block = el('section', 'table-block');
  const top = el('div', 'table-heading');
  const hint = el('span', 'scroll-hint');
  hint.append(el('strong', '', '↔'), document.createTextNode(' per veure més columnes'));
  top.append(el('h2', '', data.title), hint);
  block.append(top, renderTable(data));
  if (data.fragments?.length) {
    const fragments = el('details', 'source-fragments');
    fragments.append(el('summary', '', 'Fragments de taula pendents d’ubicar'));
    data.fragments.forEach(fragment => {
      const part = el('div', 'source-fragment');
      part.append(paragraph(fragment.text), pendingBadge(), el('p', 'fragment-note', fragment.note));
      fragments.append(part);
    });
    block.append(fragments);
  }
  block.append(el('p', 'pickup-note', pickup));
  return block;
}

function questionsBlock(section) {
  const block = el('section', 'faq-block');
  const top = el('div', 'faq-heading');
  top.append(el('h2', '', 'Preguntes freqüents'));
  const list = el('div', 'faq-list');
  section.questions.forEach(item => {
    const details = el('details', 'faq-item');
    const summary = el('summary');
    summary.append(el('span', '', item.q), el('span', 'faq-toggle', '+'));
    const answer = el('div', 'faq-answer');
    answer.append(paragraph(item.a));
    if (item.pending) answer.append(pendingBadge());
    details.append(summary, answer);
    details.addEventListener('toggle', () => {
      if (details.open) list.querySelectorAll('details').forEach(other => { if (other !== details) other.open = false; });
    });
    list.append(details);
  });
  block.append(top, list);
  return block;
}

function heading(section) {
  const header = el('div', 'panel-heading');
  const title = el('h1', '', section.title);
  if (section.kind === 'home') {
    title.replaceChildren(el('span', '', 'LA FIGUERA'), document.createTextNode(' '), el('span', 'hero-title-highlight', 'EVENTS'));
  }
  header.append(title);
  return header;
}

function sectionLead(section, introClass) {
  const lead = el('div', 'section-lead');
  const copy = el('div', 'section-lead-copy');
  copy.append(heading(section), paragraph(section.intro, introClass));
  lead.append(copy);
  if (sectionImages[section.id]) {
    const illustration = el('img', 'section-illustration');
    illustration.src = `./assets/${sectionImages[section.id]}`;
    illustration.alt = ''; illustration.width = 240; illustration.height = 180;
    lead.append(illustration);
  }
  return lead;
}

function home(section) {
  const container = el('div', 'home-content');
  const hero = el('div', 'home-hero');
  const copy = el('div', 'hero-copy');
  copy.append(heading(section));
  const greeting = el('p', 'greeting');
  greeting.append(document.createTextNode('Primer que res… '), el('span', '', 'ENHORABONA!'));
  copy.append(greeting);
  const picture = el('div', 'hero-picture');
  const illustration = el('img');
  illustration.src = './assets/cake.svg'; illustration.alt = 'Il·lustració d’una tortada de tres pisos amb flors i fruita';
  illustration.width = 540; illustration.height = 490;
  picture.append(illustration, el('span', 'handwritten', 'amb tot l’amor mundial'));
  hero.append(copy, picture);
  const opening = paragraph(introduction.text, 'home-opening');
  const choices = el('div', 'choice-grid');
  sections.slice(1, 4).forEach((item, index) => {
    const card = el('a', `choice-card choice-${index}`);
    card.href = routePath(item.id); card.dataset.section = item.id;
    const illustration = el('img', 'choice-illustration');
    illustration.src = `./assets/${sectionImages[item.id]}`;
    illustration.alt = ''; illustration.width = 240; illustration.height = 180;
    const label = el('div', 'choice-label');
    const arrow = el('span', 'choice-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    label.append(el('h2', '', item.label), arrow);
    card.append(illustration, label);
    choices.append(card);
  });
  container.append(hero, opening, choices);
  return container;
}

function contactContent(section) {
  const container = el('div', 'contact-content');
  container.append(sectionLead(section, 'contact-intro'));
  const list = el('ul', 'contact-list');
  const links = [
    ['WhatsApp', contact.phone, `https://wa.me/34${contact.phone}`, 'contact-whatsapp.svg'],
    ['Correu', contact.email, `mailto:${contact.email}`, 'contact-email.svg'],
    ['Instagram', contact.handle, 'https://www.instagram.com/lafigueravlc/', 'contact-instagram.svg'],
  ];
  links.forEach(([label, value, href, image]) => {
    const row = el('li', 'contact-row');
    const link = el('a', 'contact-link'); link.href = href;
    if (href.startsWith('https:')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    const illustration = el('img', 'contact-illustration');
    illustration.src = `./assets/${image}`;
    illustration.alt = ''; illustration.width = 100; illustration.height = 100;
    const details = el('div', 'contact-details');
    details.append(el('span', 'contact-label', label), el('span', 'contact-value', value));
    link.append(illustration, details);
    row.append(link);
    list.append(row);
  });
  container.append(list);
  return container;
}

function catalogue(section) {
  const container = el('div', 'catalogue-content');
  container.append(sectionLead(section, 'section-intro'));
  if (section.id === 'taules-dolces') {
    const link = el('a', 'inline-section-link', 'Consultar les tartes del bufet ↗');
    link.href = routePath('bufet-de-tortades'); link.dataset.section = 'bufet-de-tortades';
    container.append(link);
  }
  section.tableIds.forEach(id => container.append(tableBlock(id)));
  container.append(questionsBlock(section));
  const closing = el('a', 'closing-link'); closing.href = routePath('contacte'); closing.dataset.section = 'contacte';
  closing.append(el('span', '', 'Teniu qualsevol dubte?'), el('span', '', 'Contacteu-nos ↗'));
  container.append(closing);
  return container;
}

sections.forEach(section => {
  if (section.kind !== 'home') {
    const link = el('a', 'nav-tab', section.label);
    link.href = routePath(section.id); link.dataset.section = section.id;
    navigation.append(link);
  }
  const panel = el('section', 'panel'); panel.id = `panel-${section.id}`; panel.hidden = true;
  panel.append(section.kind === 'home' ? home(section) : section.kind === 'contact' ? contactContent(section) : catalogue(section));
  main.append(panel);
});

let selected;
function selectSection({ scroll = true } = {}) {
  const requested = sectionFromLocation(location, appRoot.pathname);
  const section = sections.find(item => item.id === requested) || sections[0];
  const canonicalURL = routePath(section.id) + location.search;
  if (location.pathname + location.search + location.hash !== canonicalURL) history.replaceState(null, '', canonicalURL);
  document.querySelectorAll('.panel').forEach(panel => { panel.hidden = panel.id !== `panel-${section.id}`; });
  document.querySelectorAll('.site-header a[data-section]').forEach(link => {
    const active = link.dataset.section === section.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  document.title = `${section.label} · La Figuera Events`;
  const changed = selected !== section.id;
  selected = section.id;
  if (scroll && changed) window.scrollTo({ top: 0, behavior: 'instant' });
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-section]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  event.preventDefault();
  const target = routePath(link.dataset.section);
  if (location.pathname + location.search + location.hash !== target) history.pushState(null, '', target);
  selectSection();
});
window.addEventListener('popstate', () => selectSection());
window.addEventListener('hashchange', () => selectSection());
selectSection({ scroll: false });
