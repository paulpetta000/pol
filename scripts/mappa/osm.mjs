// Lettura dei riquadri XML scaricati dall'API di OpenStreetMap (api/0.6/map).
// Parser minimale: l'XML dell'API ha una struttura fissa (node, way, relation con tag, nd, member).
import fs from 'node:fs';
import path from 'node:path';

const attr = (s, k) => {
  const m = s.match(new RegExp(`\\s${k}="([^"]*)"`));
  return m ? m[1].replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : undefined;
};

export function loadTiles(dir) {
  const nodes = new Map(), ways = new Map(), rels = new Map();
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.xml'))) {
    const xml = fs.readFileSync(path.join(dir, f), 'utf8');
    const re = /<(node|way|relation)\b([^>]*?)(\/>|>([\s\S]*?)<\/\1>)/g;
    let m;
    while ((m = re.exec(xml))) {
      const [, kind, head, , body = ''] = m;
      const id = attr(head, 'id');
      const tags = {};
      for (const t of body.matchAll(/<tag k="([^"]*)" v="([^"]*)"\s*\/>/g)) tags[t[1]] = t[2].replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
      if (kind === 'node') {
        if (!nodes.has(id)) nodes.set(id, { id, lat: +attr(head, 'lat'), lon: +attr(head, 'lon'), tags });
      } else if (kind === 'way') {
        if (!ways.has(id)) ways.set(id, { id, nds: [...body.matchAll(/<nd ref="(\d+)"\s*\/>/g)].map(x => x[1]), tags });
      } else if (!rels.has(id)) {
        rels.set(id, { id, members: [...body.matchAll(/<member type="(\w+)" ref="(\d+)" role="([^"]*)"\s*\/>/g)].map(x => ({ type: x[1], ref: x[2], role: x[3] })), tags });
      }
    }
  }
  return { nodes, ways, rels };
}
