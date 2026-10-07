-- Cosecha · cuentas de jugador
-- Pegar completo en Supabase → SQL Editor → Run. Se puede correr más de una vez.
--
-- Cada jugador tiene una sola fila con todo su avance (granos, álbum, récords,
-- avatar, nombre y configuración) en un JSON. Solo el dueño la puede leer o
-- cambiar. Si se borra la cuenta, la fila se borra con ella.

create table if not exists public.progreso (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  datos       jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

-- La hora de la última actualización la pone la base de datos, no el teléfono.
create or replace function public.progreso_marca() returns trigger
language plpgsql as $$
begin
  new.actualizado := now();
  return new;
end $$;

drop trigger if exists progreso_marca on public.progreso;
create trigger progreso_marca before insert or update on public.progreso
  for each row execute function public.progreso_marca();

alter table public.progreso enable row level security;

drop policy if exists "leer lo mio"    on public.progreso;
drop policy if exists "crear lo mio"   on public.progreso;
drop policy if exists "cambiar lo mio" on public.progreso;
drop policy if exists "borrar lo mio"  on public.progreso;

create policy "leer lo mio"    on public.progreso for select using (auth.uid() = user_id);
create policy "crear lo mio"   on public.progreso for insert with check (auth.uid() = user_id);
create policy "cambiar lo mio" on public.progreso for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar lo mio"  on public.progreso for delete using (auth.uid() = user_id);

-- ── Mi finca: la autopista para los vecinos (MI-FINCA.md, parte 3) ──────
-- La vista pública de cada finca: matas, plagas y construcciones, sin bodega
-- ni monedas. Cualquiera con cuenta la puede leer; solo su dueño la cambia.
create table if not exists public.fincas (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null default '',
  publica     jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
drop trigger if exists fincas_marca on public.fincas;
create trigger fincas_marca before insert or update on public.fincas
  for each row execute function public.progreso_marca();
alter table public.fincas enable row level security;
drop policy if exists "ver fincas"           on public.fincas;
drop policy if exists "crear mi finca"       on public.fincas;
drop policy if exists "cambiar mi finca"     on public.fincas;
drop policy if exists "borrar mi finca"      on public.fincas;
create policy "ver fincas"       on public.fincas for select to authenticated using (true);
create policy "crear mi finca"   on public.fincas for insert with check (auth.uid() = user_id);
create policy "cambiar mi finca" on public.fincas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar mi finca"  on public.fincas for delete using (auth.uid() = user_id);

-- Las ayudas entre vecinos: quién le curó qué mata a quién. El dueño de la
-- finca las lee al entrar y las aplica en su teléfono (FINCA.ayudar).
create table if not exists public.ayudas (
  id      bigint generated always as identity primary key,
  de      uuid not null references auth.users (id) on delete cascade,
  para    uuid not null references auth.users (id) on delete cascade,
  lote    smallint not null check (lote between 0 and 24),
  nombre  text not null default '',
  creada  timestamptz not null default now(),
  usada   boolean not null default false
);
create index if not exists ayudas_para on public.ayudas (para, usada);
alter table public.ayudas enable row level security;
drop policy if exists "ayudar a otro"     on public.ayudas;
drop policy if exists "ver mis ayudas"    on public.ayudas;
drop policy if exists "marcar mis ayudas" on public.ayudas;
create policy "ayudar a otro"     on public.ayudas for insert with check (auth.uid() = de and de <> para);
create policy "ver mis ayudas"    on public.ayudas for select using (auth.uid() = para or auth.uid() = de);
create policy "marcar mis ayudas" on public.ayudas for update using (auth.uid() = para) with check (auth.uid() = para);
