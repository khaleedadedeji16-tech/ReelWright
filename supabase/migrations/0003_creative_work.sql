-- 0003: files, books, characters, personas, projects, scenes.

-- ---------------------------------------------------------------------
-- files: every uploaded or generated file. The file itself will live in
-- Cloudflare R2; only its key is stored here. No Supabase storage buckets.
-- ---------------------------------------------------------------------
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.file_kind not null,
  storage_key text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  width integer check (width > 0),
  height integer check (height > 0),
  duration_seconds numeric(10, 3) check (duration_seconds >= 0),
  safety_status public.safety_status not null default 'not_checked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index files_user_id_idx on public.files (user_id);
create index files_user_id_kind_idx on public.files (user_id, kind);
create index files_safety_status_idx on public.files (safety_status);

create trigger files_set_updated_at
  before update on public.files
  for each row execute function public.set_updated_at();

alter table public.files enable row level security;

create policy "files: read own or admin"
  on public.files for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Read-only for users. Rows are created and removed by server code, which
-- is what issues the storage key and sets safety_status. This stops a user
-- pointing a row at someone else's stored file.
revoke all on table public.files from public, anon, authenticated, service_role;
grant select on table public.files to authenticated;
grant all on table public.files to service_role;

-- True when the id is empty or is one of the signed-in user's own files.
-- Used by policies so a row can only link to files its owner owns.
create function public.owns_file(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.files f
    where f.id = target_id and f.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_file(uuid) from public, anon;
grant execute on function public.owns_file(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- books: an author's book.
-- ---------------------------------------------------------------------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author_name text,
  genre text,
  mood text,
  summary text,
  manuscript_file_id uuid references public.files (id) on delete set null,
  cover_file_id uuid references public.files (id) on delete set null,
  status public.book_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index books_user_id_idx on public.books (user_id);
create index books_user_id_status_idx on public.books (user_id, status);
create index books_manuscript_file_id_idx on public.books (manuscript_file_id);
create index books_cover_file_id_idx on public.books (cover_file_id);

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

create function public.owns_book(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.books b
    where b.id = target_id and b.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_book(uuid) from public, anon;
grant execute on function public.owns_book(uuid) to authenticated, service_role;

alter table public.books enable row level security;

create policy "books: read own or admin"
  on public.books for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "books: insert own"
  on public.books for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_file(manuscript_file_id)
    and public.owns_file(cover_file_id)
  );

create policy "books: update own"
  on public.books for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_file(manuscript_file_id)
    and public.owns_file(cover_file_id)
  );

create policy "books: delete own"
  on public.books for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.books from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.books to authenticated;
grant all on table public.books to service_role;

-- ---------------------------------------------------------------------
-- characters: saved characters for the library.
-- ---------------------------------------------------------------------
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id uuid references public.books (id) on delete set null,
  name text not null,
  description text,
  reference_file_id uuid references public.files (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index characters_user_id_idx on public.characters (user_id);
create index characters_book_id_idx on public.characters (book_id);
create index characters_reference_file_id_idx on public.characters (reference_file_id);

create trigger characters_set_updated_at
  before update on public.characters
  for each row execute function public.set_updated_at();

alter table public.characters enable row level security;

create policy "characters: read own or admin"
  on public.characters for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "characters: insert own"
  on public.characters for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_file(reference_file_id)
  );

create policy "characters: update own"
  on public.characters for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_file(reference_file_id)
  );

create policy "characters: delete own"
  on public.characters for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.characters from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.characters to authenticated;
grant all on table public.characters to service_role;

-- ---------------------------------------------------------------------
-- personas: Fanvue personas. approval_status is set by server code only.
-- ---------------------------------------------------------------------
create table public.personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind public.persona_kind not null,
  look_description text,
  reference_file_id uuid references public.files (id) on delete set null,
  approval_status public.approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index personas_user_id_idx on public.personas (user_id);
create index personas_approval_status_idx on public.personas (approval_status);
create index personas_reference_file_id_idx on public.personas (reference_file_id);

create trigger personas_set_updated_at
  before update on public.personas
  for each row execute function public.set_updated_at();

-- If the persona itself is edited, it must be approved again. (An update
-- that sets approval_status in the same statement, i.e. the server
-- approving or rejecting, is left alone.)
create function public.personas_reset_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.approval_status = old.approval_status and (
    new.name is distinct from old.name
    or new.kind is distinct from old.kind
    or new.look_description is distinct from old.look_description
    or new.reference_file_id is distinct from old.reference_file_id
  ) then
    new.approval_status := 'pending';
  end if;
  return new;
end;
$$;

revoke execute on function public.personas_reset_approval() from public, anon, authenticated;

create trigger personas_reset_approval
  before update on public.personas
  for each row execute function public.personas_reset_approval();

create function public.owns_persona(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.personas p
    where p.id = target_id and p.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_persona(uuid) from public, anon;
grant execute on function public.owns_persona(uuid) to authenticated, service_role;

alter table public.personas enable row level security;

create policy "personas: read own or admin"
  on public.personas for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "personas: insert own"
  on public.personas for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_file(reference_file_id)
  );

create policy "personas: update own"
  on public.personas for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_file(reference_file_id)
  );

create policy "personas: delete own"
  on public.personas for delete to authenticated
  using (user_id = (select auth.uid()));

-- Users can write every column except approval_status.
revoke all on table public.personas from public, anon, authenticated, service_role;
grant select, delete on table public.personas to authenticated;
grant insert (id, user_id, name, kind, look_description, reference_file_id)
  on table public.personas to authenticated;
grant update (name, kind, look_description, reference_file_id)
  on table public.personas to authenticated;
grant all on table public.personas to service_role;

-- ---------------------------------------------------------------------
-- projects: one piece of work.
-- ---------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.project_kind not null,
  title text not null,
  status public.project_status not null default 'draft',
  target_length_seconds integer check (target_length_seconds > 0),
  aspect_ratio public.aspect_ratio,
  -- Which step of the creation flow the user is on. Free text for now;
  -- the steps are defined when the flows are built.
  current_step text,
  book_id uuid references public.books (id) on delete set null,
  persona_id uuid references public.personas (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);
create index projects_user_id_status_idx on public.projects (user_id, status);
create index projects_book_id_idx on public.projects (book_id);
create index projects_persona_id_idx on public.projects (persona_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create function public.owns_project(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.projects p
    where p.id = target_id and p.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_project(uuid) from public, anon;
grant execute on function public.owns_project(uuid) to authenticated, service_role;

alter table public.projects enable row level security;

create policy "projects: read own or admin"
  on public.projects for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "projects: insert own"
  on public.projects for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_persona(persona_id)
  );

create policy "projects: update own"
  on public.projects for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_persona(persona_id)
  );

create policy "projects: delete own"
  on public.projects for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.projects from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.projects to authenticated;
grant all on table public.projects to service_role;

-- ---------------------------------------------------------------------
-- scenes: the storyboard rows of a project.
-- ---------------------------------------------------------------------
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  position integer not null check (position >= 0),
  prompt text,
  voiceover_line text,
  length_seconds numeric(6, 2) check (length_seconds > 0),
  keyframe_file_id uuid references public.files (id) on delete set null,
  video_file_id uuid references public.files (id) on delete set null,
  status public.scene_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scenes_user_id_idx on public.scenes (user_id);
create index scenes_project_id_position_idx on public.scenes (project_id, position);
create index scenes_status_idx on public.scenes (status);
create index scenes_keyframe_file_id_idx on public.scenes (keyframe_file_id);
create index scenes_video_file_id_idx on public.scenes (video_file_id);

create trigger scenes_set_updated_at
  before update on public.scenes
  for each row execute function public.set_updated_at();

alter table public.scenes enable row level security;

create policy "scenes: read own or admin"
  on public.scenes for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "scenes: insert own"
  on public.scenes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_project(project_id)
    and public.owns_file(keyframe_file_id)
    and public.owns_file(video_file_id)
  );

create policy "scenes: update own"
  on public.scenes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_project(project_id)
    and public.owns_file(keyframe_file_id)
    and public.owns_file(video_file_id)
  );

create policy "scenes: delete own"
  on public.scenes for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.scenes from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.scenes to authenticated;
grant all on table public.scenes to service_role;
