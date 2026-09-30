-- Iscrizioni al servizio "Avvisami" della guida (solo salvataggio, nessun invio per ora)
-- Applicata al progetto Supabase coppa-america-napoli (hcicqbcmtfksraabphie) il 30/09/2026.
create table public.avvisami (
  id bigint generated always as identity primary key,
  email text not null,
  argomenti text[] not null default array['biglietti']::text[],
  lingua text not null default 'it',
  consenso boolean not null,
  versione_privacy text not null,
  creato_il timestamptz not null default now(),
  constraint avvisami_email_formato check (char_length(email) between 6 and 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint avvisami_argomenti_validi check (cardinality(argomenti) between 1 and 6 and argomenti <@ array['biglietti','ospitalita','calendario','mare','trasporti','village']::text[]),
  constraint avvisami_lingua_valida check (lingua in ('it','en','fr','es','de')),
  constraint avvisami_consenso_dato check (consenso is true),
  constraint avvisami_versione_breve check (char_length(versione_privacy) <= 20)
);

comment on table public.avvisami is 'Email di chi chiede un avviso (biglietti, calendario, ecc.). Solo inserimento dal sito; lettura riservata al titolare.';

create unique index avvisami_email_unica on public.avvisami (lower(email));
create index avvisami_creato_il on public.avvisami (creato_il);

alter table public.avvisami enable row level security;

-- Dal sito si può solo inserire: niente lettura, modifica o cancellazione
revoke all on table public.avvisami from anon, authenticated;
grant insert (email, argomenti, lingua, consenso, versione_privacy) on table public.avvisami to anon;

create policy "Iscrizione con consenso" on public.avvisami
  for insert to anon
  with check (consenso is true);

-- Freno contro gli invii automatici (massimo 20 iscrizioni al minuto in tutto) e email in minuscolo
create or replace function public.avvisami_prima_di_inserire()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.avvisami a where a.creato_il > now() - interval '1 minute') >= 20 then
    raise exception 'Troppe iscrizioni in questo momento, riprova tra un minuto' using errcode = '54000';
  end if;
  new.email := lower(btrim(new.email));
  return new;
end;
$$;

revoke all on function public.avvisami_prima_di_inserire() from public, anon, authenticated;

create trigger avvisami_prima_di_inserire
  before insert on public.avvisami
  for each row execute function public.avvisami_prima_di_inserire();
