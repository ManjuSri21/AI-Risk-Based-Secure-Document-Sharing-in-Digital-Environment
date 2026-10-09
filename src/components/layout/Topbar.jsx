import { Search, Bell } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="lg:ml-0 ml-12">
          <h1 className="text-xl font-bold text-navy-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all"
            />
          </div>

          <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-sm font-semibold">
              M
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-navy-900">Manju</p>
              <p className="text-xs text-slate-400">Document Owner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
