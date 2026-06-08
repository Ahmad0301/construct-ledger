export type UserRole = 'homeowner' | 'contractor' | 'financier' | 'admin';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'disputed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  company_name: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  address: string;
  status: ProjectStatus;
  total_budget: number | null;
  homeowner_id: string;
  contractor_id: string | null;
  financier_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  homeowner?: Profile;
  contractor?: Profile;
  milestones?: Milestone[];
  invoices?: Invoice[];
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  amount: number;
  due_date: string | null;
  completed_at: string | null;
  approved_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  milestone_id: string | null;
  contractor_id: string;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
}
