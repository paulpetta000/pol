// Le date in italiano (src/lib/formato.ts): sono giorni di calendario e non devono slittare di un giorno,
// qualunque sia il fuso orario del computer che costruisce il sito.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataLunga, dataBreve, giornoMese, giornoSettimana, intervallo, giorniTra, mono, meseBreve } from '../src/lib/formato.ts';

const FUSI = ['Europe/Rome', 'UTC', 'America/Los_Angeles', 'Pacific/Kiritimati', 'Pacific/Pago_Pago'];

test('date: stesso giorno in ogni fuso orario', t => {
  const tz = process.env.TZ;
  t.after(() => { if (tz === undefined) delete process.env.TZ; else process.env.TZ = tz; });
  for (const fuso of FUSI) {
    process.env.TZ = fuso;
    assert.equal(dataLunga('2027-05-22'), '22 maggio 2027', fuso);
    assert.equal(dataBreve('2027-01-01'), '01/01/2027', fuso);
    assert.equal(giornoSettimana('2027-05-22'), 'sabato', fuso);
    assert.equal(dataLunga(new Date('2026-12-31T00:00:00Z')), '31 dicembre 2026', fuso);
  }
});

test('date: formati brevi', () => {
  assert.equal(giornoMese('2027-07-04'), '4 luglio');
  assert.equal(mono('2027-07-04'), '04.07');
  assert.equal(meseBreve('2027-09-15'), 'set');
});

test('date: intervalli', () => {
  assert.equal(intervallo('2027-05-22'), '22 maggio');
  assert.equal(intervallo('2027-05-22', '2027-05-22'), '22 maggio');
  assert.equal(intervallo('2027-05-22', '2027-05-23'), '22–23 maggio');
  assert.equal(intervallo('2027-06-26', '2027-07-04'), '26 giugno – 4 luglio');
});

test('date: giorni tra due date, anche col cambio dell\'ora legale', () => {
  assert.equal(giorniTra('2027-03-27', '2027-03-29'), 2);
  assert.equal(giorniTra('2026-10-24', '2026-10-26'), 2);
  assert.equal(giorniTra('2026-12-31', '2027-01-01'), 1);
  assert.equal(giorniTra('2027-05-22', '2027-05-21'), -1);
});
