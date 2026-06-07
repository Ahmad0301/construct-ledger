import { createClient } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...headers, ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

export const projectsApi = {
  list: () => apiFetch<any[]>('/projects'),
  get: (id: string) => apiFetch<any>(`/projects/${id}`),
  create: (dto: any) => apiFetch<any>('/projects', { method: 'POST', body: JSON.stringify(dto) }),
  getLedger: (id: string) => apiFetch<any[]>(`/projects/${id}/ledger`),
};

export const milestonesApi = {
  list: (projectId: string) => apiFetch<any[]>(`/projects/${projectId}/milestones`),
  create: (projectId: string, dto: any) => apiFetch<any>(`/projects/${projectId}/milestones`, { method: 'POST', body: JSON.stringify(dto) }),
  approve: (projectId: string, id: string) => apiFetch<any>(`/projects/${projectId}/milestones/${id}/approve`, { method: 'PATCH' }),
};

export const invoicesApi = {
  list: (projectId: string) => apiFetch<any[]>(`/projects/${projectId}/invoices`),
  create: (projectId: string, dto: any) => apiFetch<any>(`/projects/${projectId}/invoices`, { method: 'POST', body: JSON.stringify(dto) }),
  approve: (projectId: string, id: string) => apiFetch<any>(`/projects/${projectId}/invoices/${id}/approve`, { method: 'PATCH' }),
};
