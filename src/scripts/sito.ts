// Comportamenti comuni a tutte le pagine: tema, menu, conto alla rovescia, app offline, statistiche anonime
import { SITO } from '../config/sito';

// ---- tema: automatico → chiaro → scuro ----
const root = document.documentElement;
const temaBtn = document.getElementById('tema-btn');
const NOMI: Record<string, string> = { auto: 'automatico', light: 'chiaro', dark: 'scuro' };
const aggiornaTema = () => {
  const t = root.dataset.theme || 'auto';
  temaBtn?.setAttribute('aria-label', `Tema: ${NOMI[t]}. Cambia tema`);
};
temaBtn?.addEventListener('click', () => {
  const ora = root.dataset.theme || 'auto';
  const dopo = ora === 'auto' ? 'light' : ora === 'light' ? 'dark' : 'auto';
  if (dopo === 'auto') delete root.dataset.theme; else root.dataset.theme = dopo;
  try { dopo === 'auto' ? localStorage.removeItem('tema') : localStorage.setItem('tema', dopo); } catch {}
  aggiornaTema();
});
aggiornaTema();

// ---- menu su telefono ----
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu-mob');
const chiudiMenu = () => { if (!menu || !menuBtn) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Apri il menu'); };
menuBtn?.addEventListener('click', () => {
  if (!menu) return;
  const apri = menu.hidden;
  menu.hidden = !apri;
  menuBtn.setAttribute('aria-expanded', String(apri));
  menuBtn.setAttribute('aria-label', apri ? 'Chiudi il menu' : 'Apri il menu');
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu && !menu.hidden) { chiudiMenu(); menuBtn?.focus(); } });

// ---- conto alla rovescia (giorni, ora di Napoli) ----
const oggiRoma = () => {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return new Date(p + 'T00:00:00Z');
};
document.querySelectorAll<HTMLElement>('[data-countdown]').forEach(el => {
  const target = new Date(el.dataset.countdown + 'T00:00:00Z');
  const giorni = Math.round((target.getTime() - oggiRoma().getTime()) / 86400000);
  const n = el.querySelector('[data-n]');
  const t = el.querySelector('[data-t]');
  if (!n) return;
  if (giorni > 1) { n.textContent = String(giorni); if (t) t.textContent = el.dataset.plurale || 'giorni'; }
  else if (giorni === 1) { n.textContent = '1'; if (t) t.textContent = el.dataset.singolare || 'giorno'; }
  else { el.classList.add('is-oggi'); n.textContent = giorni === 0 ? 'Oggi' : ''; if (t) t.textContent = el.dataset.passato || ''; }
});

// ---- app installabile e offline ----
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}

// ---- statistiche anonime, solo sul sito pubblico ----
// Niente cookie e niente identificativi. Chi chiede di non essere tracciato (Global Privacy Control o
// «Do Not Track» nel browser) non viene contato.
const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
if (location.hostname === new URL(SITO.url).hostname && !nav.globalPrivacyControl && nav.doNotTrack !== '1') {
  // Vercel Web Analytics: quante persone, quali pagine, da dove arrivano
  const va = document.createElement('script');
  va.defer = true;
  va.src = '/_vercel/insights/script.js';
  document.head.appendChild(va);

  // Quanto tempo resti sulla pagina (solo mentre è in primo piano): pagina, secondi e tipo di dispositivo
  let da = document.visibilityState === 'visible' ? performance.now() : 0, ms = 0, inviato = false;
  const ferma = () => { if (da) { ms += performance.now() - da; da = 0; } };
  const invia = () => {
    ferma();
    const secondi = Math.min(Math.round(ms / 1000), 3600);
    if (inviato || secondi < 1) return;
    inviato = true;
    const w = innerWidth;
    fetch(`${SITO.supabase.url}/rest/v1/letture`, {
      method: 'POST',
      keepalive: true,
      headers: { apikey: SITO.supabase.chiave, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ pagina: location.pathname.toLowerCase().slice(0, 121), secondi, dispositivo: w < 700 ? 'telefono' : w < 1100 ? 'tablet' : 'computer' })
    }).catch(() => {});
  };
  document.addEventListener('visibilitychange', () => (document.visibilityState === 'hidden' ? invia() : (da = performance.now())));
  addEventListener('pagehide', invia);
}
