// Calendari da seguire: tutto il 2027 (ac38.ics) e uno per squadra (luna-rossa.ics, ...)
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { EVENTI, eventiDi } from '../../data/eventi';
import { calendario } from '../../lib/ics';

export async function getStaticPaths() {
  const squadre = await getCollection('squadre');
  return [
    { params: { file: 'ac38' }, props: { chiave: 'ac38', nome: "America's Cup Napoli 2027", eventi: EVENTI.filter(e => e.chi !== 'nessuno'), perChi: '' } },
    ...squadre.map(s => ({
      params: { file: s.id },
      props: { chiave: s.id, nome: `${s.data.nome} · America's Cup 2027`, eventi: eventiDi(s.data.ruolo), perChi: `Calendario di ${s.data.nome}: le date delle fasi a eliminazione valgono solo se la squadra è ancora in gara.` }
    }))
  ];
}

export const GET: APIRoute = ({ props }) =>
  new Response(calendario(props.nome, props.eventi, props.perChi, props.chiave), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
