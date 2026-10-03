// Riordinare le tappe trascinandole dalla maniglia (dito o mouse). Durante il trascinamento la lista mostra
// solo le tappe: gli spostamenti tra una e l'altra si ricalcolano al rilascio. Con la tastiera e con il lettore
// di schermo si usano i pulsanti Su e Giù o le frecce sulla maniglia (src/scripts/itinerari/app.ts).
export function trascinabile(lista: HTMLElement, fine: (da: number, a: number) => void) {
  lista.addEventListener('pointerdown', e => {
    const maniglia = (e.target as Element).closest<HTMLElement>('.it-maniglia');
    if (!maniglia || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const voce = maniglia.closest<HTMLElement>('.it-voce');
    if (!voce) return;
    e.preventDefault();
    inizia(voce, maniglia, e);
  });

  function inizia(voce: HTMLElement, maniglia: HTMLElement, e: PointerEvent) {
    const voci = [...lista.querySelectorAll<HTMLElement>(':scope > .it-voce')];
    const da = voci.indexOf(voce);
    if (da < 0 || voci.length < 2) return;
    // dove hai preso la tappa, rispetto al suo bordo alto
    const presa = e.clientY - voce.querySelector<HTMLElement>('.it-blocco')!.getBoundingClientRect().top;
    lista.classList.add('it-linea--trascina');
    voce.classList.add('it-voce--presa');
    try { maniglia.setPointerCapture(e.pointerId); } catch { /* il dito è già stato sollevato */ }
    // posizioni dopo che la lista si è stretta (solo le tappe), in coordinate della pagina
    const s0 = scrollY;
    const r = voci.map(v => { const b = v.getBoundingClientRect(); return { top: b.top + s0, h: b.height }; });
    const spazio = r.length > 1 ? Math.max(0, r[1].top - (r[0].top + r[0].h)) : 0;
    const posto = r[da].h + spazio;
    let y = e.clientY, a = da, attivo = true, giro = 0;

    const posiziona = () => {
      const alto = y - presa + scrollY;               // dove sta ora il bordo alto della tappa presa (pagina)
      voce.style.transform = `translateY(${alto - r[da].top}px)`;
      const centro = alto + r[da].h / 2;
      let nuovo = da;
      for (let k = 0; k < voci.length; k++) {
        const mezzo = r[k].top + r[k].h / 2;
        if (k < da && centro < mezzo) nuovo = Math.min(nuovo, k);
        if (k > da && centro > mezzo) nuovo = Math.max(nuovo, k);
      }
      a = nuovo;
      voci.forEach((v, k) => {
        if (k === da) return;
        const sposta = a > da && k > da && k <= a ? -posto : a < da && k < da && k >= a ? posto : 0;
        v.style.transform = sposta ? `translateY(${sposta}px)` : '';
      });
    };
    // vicino ai bordi dello schermo la pagina scorre da sola
    const scorri = () => {
      if (!attivo) return;
      const margine = 72, h = innerHeight;
      const v = y < margine ? -Math.ceil((margine - y) / 6) : y > h - margine ? Math.ceil((y - (h - margine)) / 6) : 0;
      if (v) { scrollBy(0, v); posiziona(); }
      giro = requestAnimationFrame(scorri);
    };
    const muovi = (ev: PointerEvent) => { if (ev.pointerId !== e.pointerId) return; y = ev.clientY; posiziona(); };
    const chiudi = (annulla: boolean) => {
      if (!attivo) return;
      attivo = false;
      cancelAnimationFrame(giro);
      maniglia.removeEventListener('pointermove', muovi);
      maniglia.removeEventListener('pointerup', su);
      maniglia.removeEventListener('pointercancel', via);
      removeEventListener('keydown', tasto, true);
      voci.forEach(v => { v.style.transform = ''; });
      voce.classList.remove('it-voce--presa');
      lista.classList.remove('it-linea--trascina');
      if (!annulla && a !== da) fine(da, a);
    };
    const su = (ev: PointerEvent) => { if (ev.pointerId === e.pointerId) chiudi(false); };
    const via = (ev: PointerEvent) => { if (ev.pointerId === e.pointerId) chiudi(true); };
    const tasto = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); chiudi(true); } };
    maniglia.addEventListener('pointermove', muovi);
    maniglia.addEventListener('pointerup', su);
    maniglia.addEventListener('pointercancel', via);
    addEventListener('keydown', tasto, true);
    posiziona();
    giro = requestAnimationFrame(scorri);
  }
}
