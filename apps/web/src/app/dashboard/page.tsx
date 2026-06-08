'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase';
import type { Project } from '../../types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('projects')
        .select('*, milestones(id, status), invoices(id, status, amount)')
        .or(`homeowner_id.eq.${user.id},contractor_id.eq.${user.id},financier_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      setProjects((data as Project[]) ?? []);
      setLoading(false);
    }
    loadProjects();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading projects...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
        <a href="/projects/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          New Project
        </a>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No projects yet.</p>
          <p className="text-sm mt-2">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <a key={project.id} href={`/projects/${project.id}`}
              className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-slate-900">{project.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{project.address}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full
                  ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                    project.status === 'planning' ? 'bg-blue-100 text-blue-700' :
                    project.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                    'bg-yellow-100 text-yellow-700'}`}>
                  {project.status}
                </span>
              </div>
              {project.total_budget && (
                <p className="text-sm text-slate-600 mt-3">
                  Budget: <span className="font-medium">${project.total_budget.toLocaleString()}</span>
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
