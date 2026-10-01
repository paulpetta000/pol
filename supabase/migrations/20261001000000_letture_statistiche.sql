-- Statistiche anonime: quanto tempo si resta su una pagina della guida.
-- Nessun cookie, nessun indirizzo IP, nessun identificativo: solo giorno, pagina, secondi e tipo di dispositivo.
-- Il sito può solo inserire righe; le leggono solo il titolare (dashboard Supabase) e le viste qui sotto.
-- Applicata al progetto Supabase coppa-america-napoli (hcicqbcmtfksraabphie) il 01/10/2026.
create table public.letture (
  id bigint generated always as identity primary key,
  giorno date not null default ((now() at time zone 'Europe/Rome')::date),
  pagina text not null,
  secondi integer not null,
  dispositivo text not null,
  constraint letture_pagina_valida check (pagina ~ '^/[a-z0-9/._-]{0,120}$'),
  constraint letture_secondi_validi check (secondi between 1 and 3600),
  constraint letture_dispositivo_valido check (dispositivo in ('telefono', 'tablet', 'computer'))
);

comment on table public.letture is 'Tempo passato sulle pagine (statistiche anonime, nessun dato personale). Solo inserimento dal sito; lettura riservata al titolare.';
create index letture_giorno on public.letture (giorno);

alter table public.letture enable row level security;
-- Dal sito si inseriscono solo pagina, secondi e dispositivo: il giorno lo mette il database
revoke all on table public.letture from anon, authenticated;
grant insert (pagina, secondi, dispositivo) on table public.letture to anon;
create policy "Solo nuove letture" on public.letture for insert to anon with check (true);

-- Freno contro gli invii automatici: una sola riga con il conteggio del minuto in corso (massimo 600 al minuto)
create table public.letture_freno (
  minuto timestamptz primary key,
  n integer not null,
  unico boolean not null default true,
  constraint letture_freno_una_riga unique (unico),
  constraint letture_freno_solo_vero check (unico)
);
comment on table public.letture_freno is 'Una sola riga: quante letture sono arrivate nel minuto in corso (freno contro gli invii automatici).';
alter table public.letture_freno enable row level security;
revoke all on table public.letture_freno from anon, authenticated;
insert into public.letture_freno (minuto, n, unico) values (date_trunc('minute', now()), 0, true);

create function public.letture_prima_di_inserire()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare quante integer;
begin
  update public.letture_freno
     set n = case when minuto = date_trunc('minute', now()) then n + 1 else 1 end,
         minuto = date_trunc('minute', now())
   where unico
  returning n into quante;
  if quante > 600 then
    raise exception 'Troppe richieste in questo momento' using errcode = '54000';
  end if;
  return new;
end;
$fn$;

revoke all on function public.letture_prima_di_inserire() from public, anon, authenticated;

create trigger letture_prima_di_inserire
  before insert on public.letture
  for each row execute function public.letture_prima_di_inserire();

-- Riepiloghi da guardare nella dashboard (Table editor): per giorno, e per pagina negli ultimi 30 giorni
create view public.letture_per_giorno with (security_invoker = true) as
  select giorno,
         count(*) as letture,
         round(avg(secondi)) as secondi_medi,
         percentile_cont(0.5) within group (order by secondi) as secondi_mediani,
         count(*) filter (where dispositivo = 'telefono') as da_telefono
  from public.letture
  group by giorno
  order by giorno desc;

create view public.letture_per_pagina with (security_invoker = true) as
  select pagina,
         count(*) as letture,
         round(avg(secondi)) as secondi_medi,
         percentile_cont(0.5) within group (order by secondi) as secondi_mediani
  from public.letture
  where giorno > ((now() at time zone 'Europe/Rome')::date - 30)
  group by pagina
  order by letture desc;

revoke all on public.letture_per_giorno, public.letture_per_pagina from anon, authenticated;
