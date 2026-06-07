'use client';
import { useEffect, useState } from 'react';
import { projectsApi } from '../../lib/api';
import { createClient } from '../../lib/supabase';

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectsApi.list()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">ConstructLedger</h1>
        <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <a href="/projects/new" className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700">
            + New Project
          </a>
        </div>

        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No projects yet.</p>
            <p className="text-sm mt-1">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <a key={project.id} href={`/projects/${project.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-sky-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.address}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    project.status === 'active' ? 'bg-green-100 text-green-700' :
                    project.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'}`}>
                    {project.status}
                  </span>
                </div>
                {project.budget && (
                  <p className="text-sm text-gray-500 mt-3">Budget: ${Number(project.budget).toLocaleString()}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
