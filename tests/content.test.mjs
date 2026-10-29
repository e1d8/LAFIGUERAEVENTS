import test from 'node:test';
import assert from 'node:assert/strict';
import { contact, sections, tables, pickup } from '../content.js';

test('Every transcribed item has a screenshot reference and valid table links', () => {
  const sourceValid = refs => assert.ok(refs?.length && refs.every(ref => /^C(0[1-9]|1[0-3])$/.test(ref)));
  sections.filter(section => !section.kind).forEach(section => {
    sourceValid(section.source);
    section.tableIds.forEach(id => assert.ok(tables[id]));
    section.questions.forEach(item => sourceValid(item.source));
  });
  Object.values(tables).forEach(table => {
    sourceValid(table.source);
    const keys = table.columns.map(column => column.key);
    assert.equal(new Set(keys).size, keys.length);
    table.rows.forEach(row => {
      sourceValid(row.source);
      Object.keys(row.cells).forEach(key => assert.ok(keys.includes(key)));
      keys.forEach(key => {
        const value = row.cells[key];
        assert.ok(value);
        assert.equal(typeof value.text, 'string');
        if (!value.text) assert.equal(value.pending, true, 'An absent value must never silently appear empty');
      });
    });
  });
});

test('Cropped fragments stay explicitly incomplete and unassociated', () => {
  assert.equal(tables.marquesa.rows[0].cells.three.pending, true);
  assert.ok(tables.premium.rows.every(row => row.cells.name.pending));
  assert.equal(tables.buffet.columns[2].label.pending, true);
  assert.equal(tables.buffet.columns[3].label.pending, true);
});

test('Catalogue roles keep names, ingredients and price options separate', () => {
  Object.values(tables).forEach(data => {
    data.columns.forEach(column => assert.ok([undefined, 'name', 'detail', 'option'].includes(column.role)));
    const details = data.columns.filter(column => column.role === 'detail');
    assert.equal(details.length, 1);
    assert.equal(details[0].key, 'description');
    assert.equal(data.columns.filter(column => column.role === 'name').length, data === tables.cookies ? 0 : 1);
    data.columns.filter(column => !['name', 'description'].includes(column.key)).forEach(column =>
      assert.ok(column.role === undefined || column.role === 'option', 'Price options must remain visible'));
  });
});

test('Corrected wedding prices use the shared tax note', () => {
  assert.deepEqual(tables.classics.rows.map(row => [row.cells.name.text, row.cells.two.text, row.cells.three.text]), [
    ['Carrot cake', '165€*', '390€*'], ['Pastís de lotus', '165€*', '390€*'],
  ]);
  assert.ok(tables.classics.rows.every(row => Object.values(row.cells).every(value => !value.pending)));
  assert.equal(tables.classics.fragments, undefined);
  assert.equal(tables.premium.fragments, undefined);
  assert.ok(tables.premium.rows.every(row => row.cells.two.text === '185€*' && row.cells.three.text === '435€*' && !row.cells.description.pending));
  assert.match(tables.premium.rows[0].cells.description.text, /fruits secs i crunch d'avellana\.$/);
  assert.equal(tables.marquesa.rows[0].cells.two.text, '200€*');
  for (const id of ['classics', 'premium', 'marquesa']) {
    assert.deepEqual(tables[id].columns.slice(2).map(column => column.label.text), ['2 pisos (35/37 porcions)', '3 pisos (85/87 porcions)']);
  }
  assert.equal(pickup, '*Preu sense IVA. No incloem transport. Els productes s’han d’arreplegar a l’obrador.');
});

test('Other amounts retain their original tax wording', () => {
  assert.equal(tables.cookies.rows[0].cells.twentyfive.text, '45€ (sense IVA)');
  assert.equal(tables.cookies.rows[0].cells.fifty.text, '80€ (sense IVA)');
  assert.match(sections[1].questions[0].a, /21% d’IVA/);
  assert.match(sections[1].questions[6].a, /50€/);
});

test('Contact identifiers match the supplied screenshots', () => {
  assert.equal(contact.phone, '649656652');
  assert.equal(contact.email, 'lafigueravlc@gmail.com');
  assert.equal(contact.handle, '@lafigueravlc');
  assert.equal(contact.website, 'www.lafigueravlc.com');
});
