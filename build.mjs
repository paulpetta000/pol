import fs from 'node:fs';
const live = JSON.parse(fs.readFileSync('site/live.json', 'utf8'));
const tpl = ['p1', 'p2a', 'p2b', 'p3a', 'p3b'].map(p => fs.readFileSync(`src/parts/${p}.html`, 'utf8')).join('');
const json = JSON.stringify(live).replace(/</g, '\\u003c');
if (!tpl.includes('/*__LIVE__*/null')) throw new Error('placeholder missing');
fs.writeFileSync('site/index.html', tpl.replace('/*__LIVE__*/null', json));
console.log('site/index.html', fs.statSync('site/index.html').size, 'bytes · updated', live.updated);
