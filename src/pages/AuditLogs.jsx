import { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AuditLogTable from '../components/ui/AuditLogTable';
import { mockAuditLogs } from '../data/mockData';

const filterTabs = [
  { id: 'ALL', label: 'All' },
  { id: 'Success', label: 'Successful' },
  { id: 'Blocked', label: 'Blocked' },
  { id: 'Authentication', label: 'Authentication' },
  { id: 'Downloads', label: 'Downloads' },
  { id: 'Sharing', label: 'Sharing' },
];

const authActions = ['OTP Verified', 'Password Entered', 'Failed OTP'];
const downloadActions = ['Downloaded', 'Unauthorized Download'];
const sharingActions = ['Shared', 'Link Expired'];

export default function AuditLogs() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch =
      log.document.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'Success') return log.result === 'Success';
    if (activeFilter === 'Blocked') return log.result === 'Blocked';
    if (activeFilter === 'Authentication') return authActions.includes(log.action);
    if (activeFilter === 'Downloads') return downloadActions.includes(log.action);
    if (activeFilter === 'Sharing') return sharingActions.includes(log.action);
    return true;
  });

  return (
    <DashboardLayout title="Audit Logs" subtitle="Immutable forensic audit trail of all document activity">
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by document, user, or action..."
                className="input-field pl-10"
              />
            </div>
            <button className="btn-secondary whitespace-nowrap">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-navy-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{mockAuditLogs.filter((l) => l.result === 'Success').length}</p>
            <p className="text-xs text-slate-400 mt-1">Successful Events</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-rose-600">{mockAuditLogs.filter((l) => l.result === 'Blocked').length}</p>
            <p className="text-xs text-slate-400 mt-1">Blocked Attempts</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{mockAuditLogs.filter((l) => l.result === 'Warning').length}</p>
            <p className="text-xs text-slate-400 mt-1">Warnings</p>
          </div>
        </div>

        {/* Audit Table */}
        <AuditLogTable logs={filtered} />

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No audit logs match your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
