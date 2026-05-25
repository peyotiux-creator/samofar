-- ═══════════════════════════════════════════════════════════════
-- SETUP COMPLETO SUPABASE — Cuestionario FAR
-- Ejecuta este script en Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Tabla de perfiles (extiende auth.users) ────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  nombre      text,
  empresa     text,
  role        text not null default 'cliente' check (role in ('cliente', 'admin')),
  activo      boolean not null default true,
  created_at  timestamptz default now()
);

-- Trigger: crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, nombre, empresa)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'empresa', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS: perfiles
alter table public.profiles enable row level security;

create policy "usuarios_ven_su_perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admin_ve_todos_perfiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "admin_actualiza_perfiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── 2. Tabla de respuestas del cuestionario ──────────────────
create table if not exists public.respuestas_far (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  email       text not null,
  answers     jsonb not null default '{}',
  updated_at  timestamptz default now(),
  unique(user_id)
);

-- RLS: respuestas
alter table public.respuestas_far enable row level security;

create policy "usuario_ve_sus_respuestas"
  on public.respuestas_far for all
  using (auth.uid() = user_id);

create policy "admin_ve_todas_respuestas"
  on public.respuestas_far for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── 3. Storage bucket ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos-far',
  'documentos-far',
  false,
  20971520, -- 20 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/png',
    'image/jpeg',
    'application/zip'
  ]
)
on conflict (id) do nothing;

-- Políticas de storage
create policy "cliente_sube_sus_archivos"
  on storage.objects for insert
  with check (
    bucket_id = 'documentos-far'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "cliente_lee_sus_archivos"
  on storage.objects for select
  using (
    bucket_id = 'documentos-far'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "cliente_elimina_sus_archivos"
  on storage.objects for delete
  using (
    bucket_id = 'documentos-far'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "admin_lee_todos_archivos"
  on storage.objects for select
  using (
    bucket_id = 'documentos-far'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── 4. Crear tu usuario admin ─────────────────────────────────
-- DESPUÉS de ejecutar este script, ve a:
-- Supabase Dashboard → Authentication → Users → Add user
-- Crea tu usuario admin con email y contraseña seguros
-- Luego ejecuta esto con el UUID de ese usuario:
--
-- update public.profiles set role = 'admin' where email = 'tu@email.com';
--
-- ═══════════════════════════════════════════════════════════════
