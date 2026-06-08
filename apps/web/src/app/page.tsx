import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">ConstructLedger</h1>
        <p className="text-lg text-slate-600 mb-8">
          A shared project ledger for homeowners, contractors, and financial parties.
          Track milestones, approve work, and manage invoices — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
