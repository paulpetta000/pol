// Il controllo dei link interni (scripts/lib/link-interni.mjs), provato su un sito finto piccolissimo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { controllaLink } from '../scripts/lib/link-interni.mjs';

test('link: trova i link rotti e accetta quelli giusti', async t => {
  const dist = mkdtempSync(join(tmpdir(), 'link-'));
  t.after(() => rmSync(dist, { recursive: true, force: true }));
  mkdirSync(join(dist, 'calendario'));
  mkdirSync(join(dist, 'img'));
  writeFileSync(join(dist, 'calendario/index.html'), '<p>Calendario</p>');
  writeFileSync(join(dist, 'privacy.html'), '<p>Privacy</p>');
  writeFileSync(join(dist, 'img/golfo.jpg'), '');
  writeFileSync(join(dist, 'img/golfo 2x.jpg'), '');
  writeFileSync(join(dist, 'index.html'), [
    '<a href="/calendario/">giusto, cartella</a>',
    '<a href="/calendario/#oggi">giusto, con il #</a>',
    '<a href="/privacy">giusto, file .html</a>',
    '<a href="https://example.org/">esterno, non si controlla</a>',
    '<img src="/img/golfo.jpg" srcset="/img/golfo.jpg 1x, /img/golfo%202x.jpg 2x">',
    '<a href="/squadre/">rotto</a>',
    '<img src="/img/manca.jpg">',
    '<img srcset="/img/golfo.jpg 1x, /img/manca-2x.jpg 2x">'
  ].join('\n'));

  const { pagine, rotti } = await controllaLink(dist);
  assert.equal(pagine, 3);
  assert.deepEqual([...rotti.keys()].sort(), ['/img/manca-2x.jpg', '/img/manca.jpg', '/squadre/']);
  assert.deepEqual(rotti.get('/squadre/'), ['/index.html']);
});
