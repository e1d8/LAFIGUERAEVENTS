import test from 'node:test';
import assert from 'node:assert/strict';
import { contact, sections, tables } from '../dist/content.js';

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
  assert.equal(tables.classics.rows[0].cells.three.pending, true);
  assert.equal(tables.marquesa.rows[0].cells.three.pending, true);
  assert.equal(tables.classics.fragments.length, 1);
  assert.equal(tables.premium.fragments.length, 1);
  assert.equal(tables.buffet.columns[2].label.pending, true);
  assert.equal(tables.buffet.columns[3].label.pending, true);
});

test('Known amounts retain their original tax wording', () => {
  assert.equal(tables.classics.rows[0].cells.two.text, '165€ (sense IVA)');
  assert.equal(tables.premium.rows[0].cells.three.text, '435€ (sense IVA)');
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
