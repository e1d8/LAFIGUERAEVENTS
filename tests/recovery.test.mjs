import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sections, tables, introduction } from '../content.js';

// Evidence extracted from the saved original, independent of the live catalogue.
const original = JSON.parse(await readFile(new URL('../docs/original-canva.json', import.meta.url), 'utf8'));
const normalize = text => text.replace(/\s+/gu, ' ').trim();
const weddingOverrides = new Set(['carrot', 'lotus', 'premium-1', 'carabassa']);

for (const id of ['classics', 'premium', 'marquesa', 'buffet']) {
  test(`${id}: every original row is present, in order, with the recovered name, ingredients and prices`, () => {
    const source = original.tables[id].cells;
    const rows = Object.keys(source).filter(key => /^A[2-9]\d*$/.test(key)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    assert.equal(tables[id].rows.length, rows.length);
    rows.forEach((coordinate, index) => {
      const number = coordinate.slice(1);
      const row = tables[id].rows[index];
      assert.equal(row.cells.name.text, source[coordinate]);
      if (!weddingOverrides.has(row.id)) {
        const ingredients = source[`B${number}`].replace(/^SAP A FORMATGE:\s*/, '');
        assert.equal(normalize(row.cells.description.text), normalize(ingredients));
      }
      const keys = id === 'buffet' ? ['normal', 'flowers'] : ['two', 'three'];
      keys.forEach((key, option) => {
        const value = source[`${option === 0 ? 'C' : 'D'}${number}`];
        if (value === '-') {
          assert.deepEqual(row.cells[key], { text: 'Contacta’ns i et fem preu!', pending: false });
        } else {
          const expected = id === 'buffet' ? `${value.match(/\d+€/)[0]}*` : value.replace(' (sense IVA)', '*');
          assert.equal(normalize(row.cells[key].text), normalize(expected));
          assert.equal(row.cells[key].pending, false);
        }
      });
    });
  });
}

test('Buffet portion counts apply to both options through the original merged header', () => {
  const source = original.tables.buffet;
  assert.equal(source.headerReferences.D, 'C1');
  assert.equal(source.cells.C1, 'Tamany (12/15 racions)');
  assert.deepEqual(tables.buffet.columns.slice(2).map(column => column.label.text), ['Decoració normal (12/15 racions)', 'Flors de boda (12/15 racions)']);
  const cheese = tables.buffet.rows.filter(row => row.note);
  assert.deepEqual(cheese.map(row => row.id), ['favorita', 'parmigiana']);
  cheese.forEach(row => {
    assert.equal(row.note, 'SAP A FORMATGE');
    assert.ok(!row.cells.description.text.includes('SAP A FORMATGE:'));
  });
});

test('All five original Micotetes formats retain their quantities and amounts with asterisk tax notes', () => {
  const source = original.tables.cookies.cells;
  assert.equal(tables.cookies.columns.length, 6);
  tables.cookies.columns.slice(1).forEach((column, index) => {
    const coordinate = String.fromCharCode(66 + index);
    assert.equal(normalize(column.label.text), normalize(source[`${coordinate}1`]));
    const expected = normalize(source[`${coordinate}2`]).replace(' (sense IVA)', '*');
    assert.equal(normalize(tables.cookies.rows[0].cells[column.key].text), expected);
  });
});

test('Three previously cropped FAQ answers are complete and supported by the saved original', () => {
  const wedding = sections.find(section => section.id === 'tartes-nupcials');
  const buffet = sections.find(section => section.id === 'bufet-de-tortades');
  for (const [item, key] of [[wedding.questions[1], 'wedding-decoration'], [wedding.questions[5], 'wedding-flavours'], [buffet.questions[4], 'buffet-setup']]) {
    // Keep the already transcribed spelling "tarta" where the original has "tarat".
    assert.equal(item.a, original.questions[key].text.replace('una tarat de', 'una tarta de'));
    assert.ok(item.source.includes('O01'));
    assert.ok(!item.pending);
  }
});

test('The deliberately shortened home introduction stays shortened', () => {
  assert.equal(introduction.text, 'Ací teniu una relació de possibilitats de tortades meravelloses per tal que el vostre dia siga el més dolç possible, així com opcions de bufets de tartes per quedar-vos amb tota la vostra gent o taules dolces figtàstiques.');
});
