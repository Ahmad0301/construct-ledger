-- Row Level Security Policies for ConstructLedger

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is member of a project
CREATE OR REPLACE FUNCTION is_project_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND (homeowner_id = auth.uid() OR contractor_id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── PROFILES ──────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_select_project_members" ON profiles FOR SELECT
  USING (id IN (SELECT user_id FROM project_members WHERE project_id IN (
    SELECT id FROM projects WHERE homeowner_id = auth.uid() OR contractor_id = auth.uid()
  )));
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());

-- ── PROJECTS ──────────────────────────────────────────────────────────────────
CREATE POLICY "projects_select" ON projects FOR SELECT
  USING (homeowner_id = auth.uid() OR contractor_id = auth.uid() OR is_project_member(id));
CREATE POLICY "projects_insert_homeowner" ON projects FOR INSERT
  WITH CHECK (homeowner_id = auth.uid() AND get_user_role() = 'homeowner');
CREATE POLICY "projects_update_homeowner" ON projects FOR UPDATE
  USING (homeowner_id = auth.uid());
CREATE POLICY "projects_update_contractor" ON projects FOR UPDATE
  USING (contractor_id = auth.uid());

-- ── PROJECT MEMBERS ───────────────────────────────────────────────────────────
CREATE POLICY "members_select" ON project_members FOR SELECT
  USING (is_project_member(project_id));
CREATE POLICY "members_insert_homeowner" ON project_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND homeowner_id = auth.uid()));
CREATE POLICY "members_delete_homeowner" ON project_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND homeowner_id = auth.uid()));

-- ── MILESTONES ────────────────────────────────────────────────────────────────
CREATE POLICY "milestones_select" ON milestones FOR SELECT
  USING (is_project_member(project_id));
CREATE POLICY "milestones_insert" ON milestones FOR INSERT
  WITH CHECK (is_project_member(project_id) AND get_user_role() IN ('contractor', 'homeowner', 'admin'));
CREATE POLICY "milestones_update_contractor" ON milestones FOR UPDATE
  USING (submitted_by = auth.uid() OR EXISTS (
    SELECT 1 FROM projects WHERE id = project_id AND contractor_id = auth.uid()
  ));
CREATE POLICY "milestones_approve_homeowner" ON milestones FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE id = project_id AND homeowner_id = auth.uid()));

-- ── INVOICES ──────────────────────────────────────────────────────────────────
CREATE POLICY "invoices_select" ON invoices FOR SELECT
  USING (is_project_member(project_id) OR issued_by = auth.uid() OR issued_to = auth.uid());
CREATE POLICY "invoices_insert_contractor" ON invoices FOR INSERT
  WITH CHECK (issued_by = auth.uid() AND is_project_member(project_id));
CREATE POLICY "invoices_update_issuer" ON invoices FOR UPDATE
  USING (issued_by = auth.uid() AND status = 'draft');

-- ── PAYMENTS ──────────────────────────────────────────────────────────────────
CREATE POLICY "payments_select" ON payments FOR SELECT
  USING (is_project_member(project_id) OR paid_by = auth.uid());
CREATE POLICY "payments_insert" ON payments FOR INSERT
  WITH CHECK (paid_by = auth.uid() AND is_project_member(project_id));

-- ── LEDGER ENTRIES (read-only for all members, insert via service role only) ──
CREATE POLICY "ledger_select" ON ledger_entries FOR SELECT
  USING (is_project_member(project_id));
-- Inserts only via service role key (NestJS backend), not anon/user key
