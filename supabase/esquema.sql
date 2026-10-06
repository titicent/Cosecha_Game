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
