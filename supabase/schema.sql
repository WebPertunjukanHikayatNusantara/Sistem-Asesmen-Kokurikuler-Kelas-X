-- ============================================================================
-- Symphony of Nusantara (SMA PL Santo Yosef Surakarta) - Supabase Schema & RLS
-- Jalankan seluruh skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Tabel Users (Profil & Peran Pengguna)
create table if not exists public.users (
  uid text primary key,
  email text not null,
  display_name text not null default '',
  photo_url text default '',
  role text not null default 'murid' check (role in ('admin', 'pendamping', 'walikelas', 'murid')),
  assigned_division_id text,
  secondary_division_id text,
  assigned_class_group text,
  student_id text,
  class_group text,
  nisn text,
  can_export boolean default false,
  invite_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel Staff Assignments (Penugasan Email Guru Pendamping / Wali Kelas / Admin)
create table if not exists public.staff_assignments (
  id text primary key,
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('admin', 'pendamping', 'walikelas')),
  assigned_division_id text,
  assigned_class_group text,
  can_export boolean not null default true,
  assigned_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Tabel App Config (Bobot Divisi & Kebijakan Pemilihan Divisi Siswa)
create table if not exists public.app_config (
  id text primary key,
  primary_division_weight integer not null default 60,
  secondary_division_weight integer not null default 40,
  allow_student_division_selection boolean not null default true,
  updated_by text,
  updated_at timestamptz not null default now(),
  constraint app_config_weights_sum_100 check (primary_division_weight + secondary_division_weight = 100)
);

-- 4. Tabel Role Codes (Kode Akses Guru Pendamping / Wali Kelas / Admin)
create table if not exists public.role_codes (
  code text primary key,
  role text not null check (role in ('admin', 'pendamping', 'walikelas')),
  label text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 5. Tabel Students (Roster Kelas X-1 s/d X-6)
create table if not exists public.students (
  id text primary key,
  nisn text not null,
  name text not null,
  class_group text not null check (class_group in ('X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6')),
  email text not null default '',
  phone text,
  gender text not null default '-',
  primary_division_id text not null,
  secondary_division_id text default '',
  is_dpk_committee boolean not null default false,
  dpk_role_note text,
  status text not null default 'Aktif' check (status in ('Aktif', 'Perlu Sapaan')),
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_email on public.students (email);
create index if not exists idx_students_class_group on public.students (class_group);
create index if not exists idx_students_primary_div on public.students (primary_division_id);
create index if not exists idx_students_secondary_div on public.students (secondary_division_id);

-- 6. Tabel Division Peers (Direktori Rekan Sedivisi Bebas-PII untuk Apresiasi Sebaya)
create table if not exists public.division_peers (
  id text primary key,
  student_id text not null,
  student_name text not null,
  class_group text not null,
  division_id text not null,
  division_role text not null check (division_role in ('utama', 'pendukung')),
  is_dpk_committee boolean not null default false
);

create index if not exists idx_division_peers_div on public.division_peers (division_id);

-- 7. Tabel Assessments (Observasi Kualitatif 5 Dimensi & 15 Indikator oleh Guru Pendamping)
create table if not exists public.assessments (
  id text primary key,
  student_id text not null,
  student_name text not null,
  class_group text not null,
  division_id text not null,
  division_name text not null,
  project_stage text not null,
  stage_number integer not null check (stage_number between 1 and 6),
  dimension_id text not null,
  dimension_name text not null,
  formasi_grand_desain text not null,
  indicator_code text not null,
  indicator_title text not null,
  growth_level text not null check (growth_level in ('Mulai Tumbuh', 'Berkembang', 'Menjadi Teladan')),
  internal_score integer not null check (internal_score in (1, 2, 3)),
  next_step_message text not null,
  feedback text,
  teacher_id text not null,
  teacher_name text not null,
  date text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assessments_student on public.assessments (student_id);
create index if not exists idx_assessments_division on public.assessments (division_id);
create index if not exists idx_assessments_class on public.assessments (class_group);

-- 8. Tabel Self Assessments (Penilaian Diri Siswa per Indikator)
create table if not exists public.self_assessments (
  id text primary key,
  student_id text not null,
  student_name text not null,
  class_group text not null,
  primary_division_id text not null,
  secondary_division_id text default '',
  dimension_id text not null,
  dimension_name text not null,
  indicator_code text not null,
  indicator_title text not null,
  growth_level text not null check (growth_level in ('Mulai Tumbuh', 'Berkembang', 'Menjadi Teladan')),
  reflection_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Tabel Student Reflections (Refleksi Relasional Tahap 6 - Diisi 1x Lintas Divisi)
create table if not exists public.student_reflections (
  id text primary key,
  student_id text not null,
  student_name text not null,
  class_group text not null,
  primary_division_id text not null,
  secondary_division_id text default '',
  who_helped_me_grow text default '',
  who_i_helped_and_how_it_felt text default '',
  when_i_felt_valued text default '',
  what_i_am_most_grateful_for text default '',
  what_i_want_to_improve text default '',
  project_reflection_summary text default '',
  mengalami_cinta_note text default '',
  menghidupi_cinta_note text default '',
  meneruskan_cinta_note text default '',
  is_submitted boolean not null default false,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

-- 10. Tabel Appreciations (Apresiasi Pendamping, Wali Kelas, & Teman Sebaya)
create table if not exists public.appreciations (
  id text primary key,
  type text not null check (type in ('teacher_appreciation', 'peer_appreciation', 'special_contribution')),
  to_student_id text not null,
  to_student_name text not null,
  to_class_group text not null,
  division_id text not null,
  division_name text not null,
  from_user_id text not null,
  from_student_id text,
  from_name text not null,
  from_role text not null check (from_role in ('admin', 'pendamping', 'walikelas', 'murid')),
  message text not null check (char_length(message) >= 3 and char_length(message) <= 2000),
  badge_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Tabel Homeroom Notes (Catatan Pendampingan Pribadi Wali Kelas)
create table if not exists public.homeroom_notes (
  id text primary key,
  student_id text not null,
  student_name text not null,
  class_group text not null check (class_group in ('X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6')),
  teacher_id text not null,
  teacher_name text not null,
  attitude_note text default '',
  independence_note text default '',
  holistic_involvement_note text default '',
  needs_follow_up boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. Tabel Progress Logs (6 Tahap Proyek: Explore s/d Reflect)
create table if not exists public.progress_logs (
  id text primary key,
  student_id text not null,
  student_name text not null,
  class_group text not null,
  primary_division_id text,
  secondary_division_id text default '',
  stage_title text not null,
  stage_number integer not null check (stage_number between 1 and 6),
  description text not null default '',
  status text not null default 'Belum Dimulai' check (status in ('Belum Dimulai', 'Sedang Berjalan', 'Tersendat / Perlu Sapaan', 'Selesai')),
  milestone_date text not null default '',
  artifacts_note text,
  teacher_feedback text,
  student_reflection text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_progress_logs_student on public.progress_logs (student_id);

-- ============================================================================
-- Seed Awal (Idempoten)
-- ============================================================================
insert into public.app_config (id, primary_division_weight, secondary_division_weight, allow_student_division_selection)
values ('default', 60, 40, true)
on conflict (id) do nothing;

insert into public.role_codes (code, role, label, active)
values
  ('PENDAMPING2026', 'pendamping', 'Kode Guru Pendamping Divisi', true),
  ('WALIKELAS2026', 'walikelas', 'Kode Wali Kelas X-1 s/d X-6', true),
  ('ADMIN2026', 'admin', 'Kode Admin / Koordinator', true)
on conflict (code) do nothing;

-- ============================================================================
-- Helper Functions untuk Row Level Security (RLS)
-- ============================================================================
create or replace function public.my_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt()->>'email', ''));
$$;

create or replace function public.is_bootstrapped_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and public.my_email() = 'prasetyoadhitama92@gmail.com';
$$;

create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.users where uid = auth.uid()::text limit 1), 'murid');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (public.is_bootstrapped_admin() or public.my_role() = 'admin');
$$;

create or replace function public.is_pendamping()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and public.my_role() = 'pendamping';
$$;

create or replace function public.is_walikelas()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and public.my_role() = 'walikelas';
$$;

create or replace function public.is_murid()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and public.my_role() = 'murid';
$$;

create or replace function public.my_division_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select assigned_division_id from public.users where uid = auth.uid()::text limit 1), '');
$$;

create or replace function public.my_secondary_division_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select secondary_division_id from public.users where uid = auth.uid()::text limit 1), '');
$$;

create or replace function public.my_class_group()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select assigned_class_group from public.users where uid = auth.uid()::text limit 1), '');
$$;

create or replace function public.my_student_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select student_id from public.users where uid = auth.uid()::text limit 1), '');
$$;

create or replace function public.is_authorized_role_claim(p_role text, p_invite_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_role = 'murid'
    or public.is_bootstrapped_admin()
    or exists (
      select 1 from public.staff_assignments sa
      where lower(sa.email) = public.my_email() and sa.role = p_role
    )
    or exists (
      select 1 from public.role_codes rc
      where rc.code = upper(coalesce(p_invite_code, ''))
        and rc.active = true
        and rc.role = p_role
    );
$$;

-- Guard trigger agar siswa yang mengeklaim data resmi tidak mengubah nisn/name/class_group asli
create or replace function public.guard_student_claim_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and not public.is_pendamping() then
    if old.email like 'std_%@siswa.smyosef.sch.id' then
      if new.id <> old.id or new.nisn <> old.nisn or new.name <> old.name or new.class_group <> old.class_group then
        raise exception 'Siswa tidak diizinkan mengubah identitas resmi (NISN/Nama/Kelas) saat menautkan profil.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_student_claim on public.students;
create trigger trg_guard_student_claim
  before update on public.students
  for each row execute function public.guard_student_claim_update();

-- ============================================================================
-- Enable Row Level Security (RLS) & Policies
-- ============================================================================
alter table public.users enable row level security;
alter table public.staff_assignments enable row level security;
alter table public.app_config enable row level security;
alter table public.role_codes enable row level security;
alter table public.students enable row level security;
alter table public.division_peers enable row level security;
alter table public.assessments enable row level security;
alter table public.self_assessments enable row level security;
alter table public.student_reflections enable row level security;
alter table public.appreciations enable row level security;
alter table public.homeroom_notes enable row level security;
alter table public.progress_logs enable row level security;

-- 1. Users
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users for select
  using (auth.uid()::text = uid or public.is_admin());

drop policy if exists "users_insert" on public.users;
create policy "users_insert" on public.users for insert
  with check (
    public.is_admin()
    or (auth.uid()::text = uid and public.is_authorized_role_claim(role, invite_code))
  );

drop policy if exists "users_update" on public.users;
create policy "users_update" on public.users for update
  using (auth.uid()::text = uid or public.is_admin())
  with check (
    public.is_admin()
    or (
      auth.uid()::text = uid
      and (
        role = public.my_role()
        or public.is_authorized_role_claim(role, invite_code)
      )
    )
  );

drop policy if exists "users_delete" on public.users;
create policy "users_delete" on public.users for delete
  using (public.is_admin());

-- 2. Staff Assignments
drop policy if exists "staff_select" on public.staff_assignments;
create policy "staff_select" on public.staff_assignments for select
  using (public.is_admin() or (auth.uid() is not null and lower(email) = public.my_email()));

drop policy if exists "staff_write" on public.staff_assignments;
create policy "staff_write" on public.staff_assignments for all
  using (public.is_admin()) with check (public.is_admin());

-- 3. App Config
drop policy if exists "app_config_select" on public.app_config;
create policy "app_config_select" on public.app_config for select
  using (auth.uid() is not null);

drop policy if exists "app_config_write" on public.app_config;
create policy "app_config_write" on public.app_config for all
  using (public.is_admin()) with check (public.is_admin());

-- 4. Role Codes (hanya Admin)
drop policy if exists "role_codes_admin" on public.role_codes;
create policy "role_codes_admin" on public.role_codes for all
  using (public.is_admin()) with check (public.is_admin());

-- 5. Students
drop policy if exists "students_select" on public.students;
create policy "students_select" on public.students for select
  using (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_walikelas() and class_group = public.my_class_group())
    or (public.is_murid() and lower(email) = public.my_email())
  );

drop policy if exists "students_insert" on public.students;
create policy "students_insert" on public.students for insert
  with check (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_murid() and lower(email) = public.my_email())
  );

drop policy if exists "students_update" on public.students;
create policy "students_update" on public.students for update
  using (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_murid() and lower(email) = public.my_email())
    or (public.is_murid() and email like 'std_%@siswa.smyosef.sch.id')
  )
  with check (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_murid() and lower(email) = public.my_email())
  );

drop policy if exists "students_delete" on public.students;
create policy "students_delete" on public.students for delete
  using (public.is_admin());

-- 6. Division Peers
drop policy if exists "peers_select" on public.division_peers;
create policy "peers_select" on public.division_peers for select
  using (
    public.is_admin()
    or public.is_pendamping()
    or public.is_walikelas()
    or (public.is_murid() and (division_id = public.my_division_id() or division_id = public.my_secondary_division_id()))
  );

drop policy if exists "peers_write" on public.division_peers;
create policy "peers_write" on public.division_peers for insert
  with check (
    public.is_admin()
    or (public.is_pendamping() and division_id = public.my_division_id())
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "peers_update" on public.division_peers;
create policy "peers_update" on public.division_peers for update
  using (
    public.is_admin()
    or (public.is_pendamping() and division_id = public.my_division_id())
    or (public.is_murid() and student_id = public.my_student_id())
  )
  with check (
    public.is_admin()
    or (public.is_pendamping() and division_id = public.my_division_id())
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "peers_delete" on public.division_peers;
create policy "peers_delete" on public.division_peers for delete
  using (public.is_admin() or (public.is_murid() and student_id = public.my_student_id()));

-- 7. Assessments
drop policy if exists "assessments_select" on public.assessments;
create policy "assessments_select" on public.assessments for select
  using (
    public.is_admin()
    or (public.is_pendamping() and division_id = public.my_division_id())
    or (public.is_walikelas() and class_group = public.my_class_group())
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "assessments_insert" on public.assessments;
create policy "assessments_insert" on public.assessments for insert
  with check (
    public.is_admin()
    or (public.is_pendamping() and division_id = public.my_division_id() and teacher_id = auth.uid()::text)
  );

drop policy if exists "assessments_update" on public.assessments;
create policy "assessments_update" on public.assessments for update
  using (public.is_admin() or (public.is_pendamping() and division_id = public.my_division_id()))
  with check (public.is_admin() or (public.is_pendamping() and division_id = public.my_division_id()));

drop policy if exists "assessments_delete" on public.assessments;
create policy "assessments_delete" on public.assessments for delete
  using (public.is_admin() or (public.is_pendamping() and division_id = public.my_division_id()));

-- 8. Self Assessments
drop policy if exists "self_asm_select" on public.self_assessments;
create policy "self_asm_select" on public.self_assessments for select
  using (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_walikelas() and class_group = public.my_class_group())
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "self_asm_write" on public.self_assessments;
create policy "self_asm_write" on public.self_assessments for all
  using (public.is_admin() or (public.is_murid() and student_id = public.my_student_id()))
  with check (public.is_admin() or (public.is_murid() and student_id = public.my_student_id()));

-- 9. Student Reflections
drop policy if exists "reflections_select" on public.student_reflections;
create policy "reflections_select" on public.student_reflections for select
  using (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_walikelas() and class_group = public.my_class_group())
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "reflections_write" on public.student_reflections;
create policy "reflections_write" on public.student_reflections for all
  using (public.is_admin() or (public.is_murid() and student_id = public.my_student_id()))
  with check (public.is_admin() or (public.is_murid() and student_id = public.my_student_id()));

-- 10. Appreciations
drop policy if exists "appreciations_select" on public.appreciations;
create policy "appreciations_select" on public.appreciations for select
  using (
    public.is_admin()
    or (public.is_pendamping() and division_id = public.my_division_id())
    or (public.is_walikelas() and to_class_group = public.my_class_group())
    or (public.is_murid() and (to_student_id = public.my_student_id() or from_user_id = auth.uid()::text))
  );

drop policy if exists "appreciations_insert" on public.appreciations;
create policy "appreciations_insert" on public.appreciations for insert
  with check (
    public.is_admin()
    or (public.is_pendamping() and division_id = public.my_division_id() and from_user_id = auth.uid()::text and type in ('teacher_appreciation', 'special_contribution'))
    or (public.is_walikelas() and to_class_group = public.my_class_group() and from_user_id = auth.uid()::text and type in ('teacher_appreciation', 'special_contribution'))
    or (public.is_murid() and type = 'peer_appreciation' and from_user_id = auth.uid()::text and to_student_id <> public.my_student_id() and (division_id = public.my_division_id() or division_id = public.my_secondary_division_id()))
  );

drop policy if exists "appreciations_modify" on public.appreciations;
create policy "appreciations_modify" on public.appreciations for delete
  using (
    public.is_admin()
    or (public.is_pendamping() and from_user_id = auth.uid()::text)
    or (public.is_walikelas() and from_user_id = auth.uid()::text)
    or (public.is_murid() and from_user_id = auth.uid()::text and type = 'peer_appreciation')
  );

-- 11. Homeroom Notes
drop policy if exists "homeroom_select" on public.homeroom_notes;
create policy "homeroom_select" on public.homeroom_notes for select
  using (
    public.is_admin()
    or (public.is_walikelas() and class_group = public.my_class_group())
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "homeroom_write" on public.homeroom_notes;
create policy "homeroom_write" on public.homeroom_notes for all
  using (public.is_admin() or (public.is_walikelas() and class_group = public.my_class_group() and teacher_id = auth.uid()::text))
  with check (public.is_admin() or (public.is_walikelas() and class_group = public.my_class_group() and teacher_id = auth.uid()::text));

-- 12. Progress Logs
drop policy if exists "logs_select" on public.progress_logs;
create policy "logs_select" on public.progress_logs for select
  using (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_walikelas() and class_group = public.my_class_group())
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "logs_insert" on public.progress_logs;
create policy "logs_insert" on public.progress_logs for insert
  with check (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "logs_update" on public.progress_logs;
create policy "logs_update" on public.progress_logs for update
  using (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_murid() and student_id = public.my_student_id())
  )
  with check (
    public.is_admin()
    or (public.is_pendamping() and (primary_division_id = public.my_division_id() or secondary_division_id = public.my_division_id()))
    or (public.is_murid() and student_id = public.my_student_id())
  );

drop policy if exists "logs_delete" on public.progress_logs;
create policy "logs_delete" on public.progress_logs for delete
  using (public.is_admin());
