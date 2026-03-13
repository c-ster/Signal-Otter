-- Signal Otter — Initial Schema
-- Tables: student_profiles, opportunities, candidate_pages, evidence_items,
--   mini_projects, mini_prds, mini_todos, two_week_plans, generation_runs, published_pages

---------------------------------------------------------------
-- ENUMS
---------------------------------------------------------------

create type candidate_page_status as enum (
  'draft',
  'intake_complete',
  'problem_selected',
  'narrative_generated',
  'prd_generated',
  'todo_generated',
  'mini_app_generated',
  'two_week_plan_generated',
  'published'
);

create type evidence_type as enum (
  'project',
  'internship',
  'research',
  'leadership',
  'certification',
  'publication',
  'hackathon',
  'award',
  'other'
);

create type template_type as enum (
  'analytics_dashboard',
  'operations_monitor',
  'ai_insight_tool',
  'optimization_simulator',
  'ab_test_dashboard',
  'social_media_dashboard'
);

create type generation_type as enum (
  'problem_template',
  'recruiter_summary',
  'why_this_company',
  'evidence_summary',
  'mini_prd',
  'mini_todo',
  'two_week_plan',
  'mini_app_config'
);

create type generation_status as enum (
  'pending',
  'running',
  'completed',
  'failed'
);

---------------------------------------------------------------
-- TABLES
---------------------------------------------------------------

create table student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  school text,
  graduation_date date,
  major text,
  bio text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  resume_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profiles_user_id_key unique (user_id)
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  role_title text not null,
  job_description text,
  company_url text,
  target_industry text,
  why_this_company_md text,
  relevant_experience_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table candidate_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  slug text,
  headline text,
  recruiter_summary_md text,
  why_this_company_md text,
  evidence_summary_md text,
  thinking_md text,
  status candidate_page_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint candidate_pages_opportunity_id_key unique (opportunity_id)
);

create table evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_page_id uuid references candidate_pages(id) on delete set null,
  title text not null,
  type evidence_type not null default 'other',
  description text,
  url text,
  impact_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mini_projects (
  id uuid primary key default gen_random_uuid(),
  candidate_page_id uuid not null references candidate_pages(id) on delete cascade,
  template_type template_type not null,
  problem_statement text,
  solution_summary text,
  assumptions_md text,
  app_config_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mini_prds (
  id uuid primary key default gen_random_uuid(),
  mini_project_id uuid not null references mini_projects(id) on delete cascade,
  prd_md text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mini_prds_mini_project_id_key unique (mini_project_id)
);

create table mini_todos (
  id uuid primary key default gen_random_uuid(),
  mini_project_id uuid not null references mini_projects(id) on delete cascade,
  todo_json jsonb,
  todo_md text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mini_todos_mini_project_id_key unique (mini_project_id)
);

create table two_week_plans (
  id uuid primary key default gen_random_uuid(),
  mini_project_id uuid not null references mini_projects(id) on delete cascade,
  plan_md text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint two_week_plans_mini_project_id_key unique (mini_project_id)
);

create table generation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_page_id uuid not null references candidate_pages(id) on delete cascade,
  generation_type generation_type not null,
  prompt_version text,
  input_json jsonb,
  output_json jsonb,
  status generation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table published_pages (
  id uuid primary key default gen_random_uuid(),
  candidate_page_id uuid not null references candidate_pages(id) on delete cascade,
  public_slug text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_pages_candidate_page_id_key unique (candidate_page_id),
  constraint published_pages_public_slug_key unique (public_slug)
);

---------------------------------------------------------------
-- INDEXES
---------------------------------------------------------------

create index idx_opportunities_user_id on opportunities(user_id);
create index idx_candidate_pages_user_id on candidate_pages(user_id);
create index idx_candidate_pages_opportunity_id on candidate_pages(opportunity_id);
create index idx_evidence_items_user_id on evidence_items(user_id);
create index idx_evidence_items_candidate_page_id on evidence_items(candidate_page_id);
create index idx_generation_runs_user_id on generation_runs(user_id);
create index idx_generation_runs_candidate_page_id on generation_runs(candidate_page_id);
create index idx_published_pages_public_slug on published_pages(public_slug);

---------------------------------------------------------------
-- ROW LEVEL SECURITY
---------------------------------------------------------------

alter table student_profiles enable row level security;
alter table opportunities enable row level security;
alter table candidate_pages enable row level security;
alter table evidence_items enable row level security;
alter table mini_projects enable row level security;
alter table mini_prds enable row level security;
alter table mini_todos enable row level security;
alter table two_week_plans enable row level security;
alter table generation_runs enable row level security;
alter table published_pages enable row level security;

-- student_profiles
create policy "Users can view own profile" on student_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own profile" on student_profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own profile" on student_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- opportunities
create policy "Users can view own opportunities" on opportunities
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own opportunities" on opportunities
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own opportunities" on opportunities
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own opportunities" on opportunities
  for delete to authenticated using (auth.uid() = user_id);

-- candidate_pages
create policy "Users can view own candidate pages" on candidate_pages
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own candidate pages" on candidate_pages
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own candidate pages" on candidate_pages
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read for published candidate pages (via join with published_pages)
create policy "Anyone can view published candidate pages" on candidate_pages
  for select to anon using (
    exists (
      select 1 from published_pages
      where published_pages.candidate_page_id = candidate_pages.id
        and published_pages.is_public = true
    )
  );

-- evidence_items
create policy "Users can view own evidence items" on evidence_items
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own evidence items" on evidence_items
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own evidence items" on evidence_items
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own evidence items" on evidence_items
  for delete to authenticated using (auth.uid() = user_id);

-- Public read for evidence on published pages
create policy "Anyone can view evidence on published pages" on evidence_items
  for select to anon using (
    exists (
      select 1 from candidate_pages
      join published_pages on published_pages.candidate_page_id = candidate_pages.id
      where candidate_pages.id = evidence_items.candidate_page_id
        and published_pages.is_public = true
    )
  );

-- mini_projects (access through candidate_page ownership)
create policy "Users can view own mini projects" on mini_projects
  for select to authenticated using (
    exists (select 1 from candidate_pages where candidate_pages.id = mini_projects.candidate_page_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can insert own mini projects" on mini_projects
  for insert to authenticated with check (
    exists (select 1 from candidate_pages where candidate_pages.id = mini_projects.candidate_page_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can update own mini projects" on mini_projects
  for update to authenticated using (
    exists (select 1 from candidate_pages where candidate_pages.id = mini_projects.candidate_page_id and candidate_pages.user_id = auth.uid())
  );

-- Public read for mini_projects on published pages
create policy "Anyone can view mini projects on published pages" on mini_projects
  for select to anon using (
    exists (
      select 1 from candidate_pages
      join published_pages on published_pages.candidate_page_id = candidate_pages.id
      where candidate_pages.id = mini_projects.candidate_page_id
        and published_pages.is_public = true
    )
  );

-- mini_prds
create policy "Users can view own mini prds" on mini_prds
  for select to authenticated using (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = mini_prds.mini_project_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can insert own mini prds" on mini_prds
  for insert to authenticated with check (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = mini_prds.mini_project_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can update own mini prds" on mini_prds
  for update to authenticated using (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = mini_prds.mini_project_id and candidate_pages.user_id = auth.uid())
  );

-- mini_todos
create policy "Users can view own mini todos" on mini_todos
  for select to authenticated using (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = mini_todos.mini_project_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can insert own mini todos" on mini_todos
  for insert to authenticated with check (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = mini_todos.mini_project_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can update own mini todos" on mini_todos
  for update to authenticated using (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = mini_todos.mini_project_id and candidate_pages.user_id = auth.uid())
  );

-- two_week_plans
create policy "Users can view own two week plans" on two_week_plans
  for select to authenticated using (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = two_week_plans.mini_project_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can insert own two week plans" on two_week_plans
  for insert to authenticated with check (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = two_week_plans.mini_project_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can update own two week plans" on two_week_plans
  for update to authenticated using (
    exists (select 1 from mini_projects join candidate_pages on candidate_pages.id = mini_projects.candidate_page_id where mini_projects.id = two_week_plans.mini_project_id and candidate_pages.user_id = auth.uid())
  );

-- generation_runs
create policy "Users can view own generation runs" on generation_runs
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own generation runs" on generation_runs
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own generation runs" on generation_runs
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- published_pages
create policy "Anyone can view public published pages" on published_pages
  for select to anon using (is_public = true);
create policy "Authenticated users can view own published pages" on published_pages
  for select to authenticated using (
    exists (select 1 from candidate_pages where candidate_pages.id = published_pages.candidate_page_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can insert own published pages" on published_pages
  for insert to authenticated with check (
    exists (select 1 from candidate_pages where candidate_pages.id = published_pages.candidate_page_id and candidate_pages.user_id = auth.uid())
  );
create policy "Users can update own published pages" on published_pages
  for update to authenticated using (
    exists (select 1 from candidate_pages where candidate_pages.id = published_pages.candidate_page_id and candidate_pages.user_id = auth.uid())
  );

---------------------------------------------------------------
-- UPDATED_AT TRIGGERS
---------------------------------------------------------------

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_student_profiles_updated_at before update on student_profiles for each row execute function update_updated_at_column();
create trigger update_opportunities_updated_at before update on opportunities for each row execute function update_updated_at_column();
create trigger update_candidate_pages_updated_at before update on candidate_pages for each row execute function update_updated_at_column();
create trigger update_evidence_items_updated_at before update on evidence_items for each row execute function update_updated_at_column();
create trigger update_mini_projects_updated_at before update on mini_projects for each row execute function update_updated_at_column();
create trigger update_mini_prds_updated_at before update on mini_prds for each row execute function update_updated_at_column();
create trigger update_mini_todos_updated_at before update on mini_todos for each row execute function update_updated_at_column();
create trigger update_two_week_plans_updated_at before update on two_week_plans for each row execute function update_updated_at_column();
create trigger update_generation_runs_updated_at before update on generation_runs for each row execute function update_updated_at_column();
create trigger update_published_pages_updated_at before update on published_pages for each row execute function update_updated_at_column();
