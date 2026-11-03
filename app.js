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
  'tartes-nupcials': 'nupcial-painted.png',
  'bufet-de-tortades': 'torta-painted.png',
  'taules-dolces': 'galetes-painted.png',
  contacte: 'contacte-painted.png',
};
const el = (tag, className = '', text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function arrowImage(direction = 'diagonal', className = '') {
  const image = el('img', `arrow-image ${className}`.trim());
  image.src = `./assets/arrow-${direction}.svg`;
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  image.width = 32; image.height = direction === 'horizontal' ? 20 : 32;
  return image;
}

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

let underlineBag = [];
let lastUnderline;
function productNameText(text) {
  if (!underlineBag.length) {
    underlineBag = [0, 1, 2, 3];
    for (let i = underlineBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [underlineBag[i], underlineBag[j]] = [underlineBag[j], underlineBag[i]];
    }
    // Use every stroke before reshuffling, without repeating at a bag boundary.
    if (underlineBag[3] === lastUnderline) [underlineBag[0], underlineBag[3]] = [underlineBag[3], underlineBag[0]];
  }
  const name = el('span', 'product-name-text marker-text');
  lastUnderline = underlineBag.pop();
  name.dataset.underline = lastUnderline;
  richText(name, text);
  return name;
}

// New columns default to visible options; missing values remain explicitly pending.
export function renderCatalogue(data, firstIndex = 0) {
  const list = el('div', 'product-list');
  const nameColumns = data.columns.filter(column => column.role === 'name');
  const detailColumns = data.columns.filter(column => column.role === 'detail');
  const optionColumns = data.columns.filter(column => !['name', 'detail'].includes(column.role));
  data.rows.forEach((row, index) => {
    const item = el('article', `product-item${(firstIndex + index) % 2 ? ' product-item-rose' : ''}`);
    item.dataset.rowId = row.id;
    const name = el('h3', 'product-name');
    nameColumns.forEach(column => {
      const label = el('span', 'visually-hidden');
      renderCell(label, column.label);
      const value = el('span', 'product-name-value');
      value.dataset.columnKey = column.key;
      const cell = row.cells[column.key];
      if (cell?.text) {
        value.append(productNameText(cell.text));
      }
      if (!cell || cell.pending) value.append(pendingBadge());
      name.append(label, value);
    });
    if (!nameColumns.length) name.append(productNameText(data.title));
    const options = el('div', 'product-options');
    optionColumns.forEach(column => {
      const option = el('span', 'product-option');
      option.dataset.columnKey = column.key;
      const label = el('span', 'product-option-label');
      const value = el('span', 'product-option-value');
      renderCell(label, column.label);
      renderCell(value, row.cells[column.key]);
      option.append(label, value);
      options.append(option);
    });
    const description = el('div', 'product-details');
    detailColumns.forEach(column => {
      const field = el('div', 'product-detail');
      field.dataset.columnKey = column.key;
      renderCell(field, row.cells[column.key]);
      description.append(field);
    });
    if (row.note) description.append(el('small', 'product-note', row.note));
    item.append(name, description, options);
    list.append(item);
  });
  return list;
}

function catalogueBlock(id, firstIndex) {
  const data = tables[id];
  const block = el('section', 'catalogue-block');
  block.dataset.catalogueId = id;
  block.append(el('h2', 'catalogue-heading', data.title), renderCatalogue(data, firstIndex));
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
  header.append(title);
  return header;
}

function sectionLead(section, { illustrated = true } = {}) {
  const lead = el('div', `section-lead${illustrated ? '' : ' section-lead-text'}`);
  const copy = el('div', 'section-lead-copy');
  copy.append(heading(section), paragraph(section.intro, 'section-intro'));
  lead.append(copy);
  if (illustrated && sectionImages[section.id]) {
    const illustration = el('img', 'section-illustration');
    illustration.src = `./assets/${sectionImages[section.id]}`;
    illustration.alt = ''; illustration.width = 240; illustration.height = 180;
    lead.append(illustration);
  }
  return lead;
}

function home() {
  const container = el('div', 'home-content');
  const greeting = el('h1', 'home-greeting');
  greeting.append(document.createTextNode('Primer que res…'), el('br'), el('strong', '', 'ENHORABONA!'));
  const opening = paragraph(introduction.text, 'home-opening');
  const choices = el('nav', 'home-choices');
  choices.setAttribute('aria-label', 'Seccions de La Figuera Events');
  sections.filter(section => section.kind !== 'home').forEach((section, index) => {
    const link = el('a', 'home-choice');
    link.href = routePath(section.id);
    link.dataset.section = section.id;
    const image = el('img', 'home-choice-image');
    image.src = `./assets/${sectionImages[section.id]}`;
    image.alt = ''; image.width = 240; image.height = 180;
    const title = el('span', 'home-choice-title marker-text', section.label);
    title.dataset.underline = index;
    link.append(image, title);
    choices.append(link);
  });
  container.append(greeting, opening, choices);
  return container;
}

function contactContent(section) {
  const container = el('div', 'contact-content');
  container.append(sectionLead(section, { illustrated: false }));
  const list = el('ul', 'contact-list');
  const links = [
    ['WhatsApp', contact.phone, `https://wa.me/34${contact.phone}`, 'contact-whatsapp-painted.png'],
    ['Correu', contact.email, `mailto:${contact.email}`, 'contacte-painted.png'],
    ['Instagram', contact.handle, 'https://www.instagram.com/lafigueravlc/', 'contact-instagram-painted.png'],
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
  container.append(sectionLead(section));
  if (section.id === 'taules-dolces') {
    const link = el('a', 'inline-section-link', 'Consultar les tartes del bufet');
    link.append(arrowImage());
    link.href = routePath('bufet-de-tortades'); link.dataset.section = 'bufet-de-tortades';
    container.append(link);
  }
  let productIndex = 0;
  section.tableIds.forEach(id => {
    container.append(catalogueBlock(id, productIndex));
    productIndex += tables[id].rows.length;
  });
  container.append(questionsBlock(section));
  const closing = el('a', 'closing-link'); closing.href = routePath('contacte'); closing.dataset.section = 'contacte';
  const closingLabel = el('span', 'closing-label', 'Contacteu-nos');
  closingLabel.append(arrowImage());
  closing.append(el('span', '', 'Teniu qualsevol dubte?'), closingLabel);
  container.append(closing);
  return container;
}

sections.forEach(section => {
  if (section.kind !== 'home') {
    const link = el('a', 'nav-tab');
    const label = el('span', 'nav-label marker-text', section.label);
    label.dataset.underline = navigation.children.length;
    link.append(label);
    link.href = routePath(section.id); link.dataset.section = section.id;
    navigation.append(link);
  }
  const panel = el('section', 'panel'); panel.id = `panel-${section.id}`; panel.hidden = true;
  panel.append(section.kind === 'home' ? home() : section.kind === 'contact' ? contactContent(section) : catalogue(section));
  main.append(panel);
});

let selected;
function selectSection({ scroll = true } = {}) {
  const requested = sectionFromLocation(location, appRoot.pathname);
  const section = sections.find(item => item.id === requested) || sections[0];
  const changed = selected !== section.id;
  if (changed) main.querySelectorAll('details[open]').forEach(details => { details.open = false; });
  const canonicalURL = routePath(section.id) + location.search;
  if (location.pathname + location.search + location.hash !== canonicalURL) history.replaceState(null, '', canonicalURL);
  const isHome = section.kind === 'home';
  document.body.classList.toggle('is-home', isHome);
  navigation.hidden = isHome;
  document.querySelectorAll('.panel').forEach(panel => { panel.hidden = panel.id !== `panel-${section.id}`; });
  document.querySelectorAll('.site-header a[data-section]').forEach(link => {
    const active = link.dataset.section === section.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  document.title = section.pageTitle;
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
