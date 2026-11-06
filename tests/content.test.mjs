import test from 'node:test';
import assert from 'node:assert/strict';
import { contact, sections, tables, pickup } from '../content.js';

test('Every transcribed item has a capture or recovered original reference and valid table links', () => {
  const sourceValid = refs => assert.ok(refs?.length && refs.every(ref => /^(C(0[1-9]|1[0-3])|O01)$/.test(ref)));
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

test('Recovered fields are complete and personalized prices invite contact', () => {
  Object.values(tables).forEach(table => {
    table.columns.forEach(column => assert.ok(!column.label.pending));
    table.rows.forEach(row => Object.entries(row.cells).forEach(([key, value]) => {
      if (row.id === 'personalitzada' && ['two', 'three'].includes(key)) {
        assert.equal(value.pending, false);
        assert.equal(value.text, 'Contacta’ns i et fem preu!');
      } else assert.equal(value.pending, false, `${row.id}/${key}`);
    }));
  });
  sections.forEach(section => section.questions?.forEach(item => assert.ok(!item.pending)));
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
  assert.deepEqual(tables.classics.rows.filter(row => ['carrot', 'lotus'].includes(row.id)).map(row => [row.cells.name.text, row.cells.two.text, row.cells.three.text]), [
    ['Carrot cake', '165€*', '390€*'], ['Pastís de lotus', '165€*', '390€*'],
  ]);
  assert.ok(tables.classics.rows.every(row => Object.values(row.cells).every(value => !value.pending)));
  assert.equal(tables.classics.fragments, undefined);
  assert.equal(tables.premium.fragments, undefined);
  assert.ok(tables.premium.rows.every(row => row.cells.two.text === '185€*' && row.cells.three.text === '435€*' && !row.cells.description.pending));
  assert.equal(tables.classics.rows.find(row => row.id === 'carrot').cells.description.text, 'Biscuit de carlota espècies amb crema de tormatge fruits secs.');
  assert.equal(tables.classics.rows.find(row => row.id === 'lotus').cells.description.text, 'Biscuit de xocolata banyat amb café buttercream de la famosa galeta lotus.');
  assert.equal(tables.premium.rows[0].cells.description.text, "Tarta de biscuit de xoco banyat amb café, buttercream de dulce de leche, fruits secs i crunch d'avellana.");
  assert.equal(tables.marquesa.rows[0].cells.two.text, '200€*');
  for (const id of ['classics', 'premium', 'marquesa']) {
    assert.deepEqual(tables[id].columns.slice(2).map(column => column.label.text), ['2 pisos (35/37 porcions)', '3 pisos (85/87 porcions)']);
  }
  assert.equal(pickup, '*Preu sense IVA. No incloem transport. Els productes s’han d’arreplegar a l’obrador.');
});

test('Buffet and Micotetes prices share the asterisk tax note while FAQ amounts retain their wording', () => {
  for (const row of tables.buffet.rows) {
    assert.match(row.cells.normal.text, /^\d+€\*$/);
    assert.match(row.cells.flowers.text, /^\d+€\*$/);
  }
  assert.deepEqual(['twentyfive', 'fifty', 'seventyfive', 'hundred'].map(key => tables.cookies.rows[0].cells[key].text), ['45€*', '80€*', '105€*', '120€*']);
  assert.equal(tables.cookies.rows[0].cells.overhundred.text, 'Contacta’ns i et fem preu!');
  assert.match(sections[1].questions[0].a, /21% d’IVA/);
  assert.match(sections[1].questions[6].a, /50€/);
});

test('Contact identifiers match the supplied screenshots', () => {
  assert.equal(contact.phone, '649656652');
  assert.equal(contact.email, 'lafigueravlc@gmail.com');
  assert.equal(contact.handle, '@lafigueravlc');
  assert.equal(contact.website, 'www.lafigueravlc.com');
});
