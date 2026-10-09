import { useState } from 'react';
import { Search, FileText, ShieldCheck, Filter } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskBadge from '../components/ui/RiskBadge';
import { mockDocuments } from '../data/mockData';

const policies = {
  HIGH: 'AES-256 + OTP + Watermark',
  MEDIUM: 'AES-256 + Password',
  LOW: 'Basic Encryption',
};

export default function AdminDocuments() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const docs = mockDocuments.concat(mockDocuments.slice(0, 2)).map((d, i) => ({
    ...d,
    id: `admin-${i}`,
    owner: ['Manju', 'Arjun', 'Kavya', 'Rahul'][i % 4],
    policy: policies[d.riskLevel] || 'Basic',
    lastActivity: d.lastAccessed,
  }));

  const filtered = docs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchRisk && matchStatus;
  });

  return (
    <DashboardLayout title="Document Monitoring" subtitle="Inspect all documents and risk levels across the system" isAdmin>
      <div className="space-y-6">
        {/* Controls */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by document or owner..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input-field cursor-pointer w-auto"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field cursor-pointer w-auto"
              >
                <option value="ALL">All Statuses</option>
                <option value="Protected">Protected</option>
                <option value="Shared">Shared</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-rose-600">{docs.filter((d) => d.riskLevel === 'HIGH').length}</p>
            <p className="text-xs text-slate-400 mt-1">High Risk</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{docs.filter((d) => d.riskLevel === 'MEDIUM').length}</p>
            <p className="text-xs text-slate-400 mt-1">Medium Risk</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{docs.filter((d) => d.riskLevel === 'LOW').length}</p>
            <p className="text-xs text-slate-400 mt-1">Low Risk</p>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-navy-900">{doc.name}</p>
                          <p className="text-xs text-slate-400">{doc.type} · {doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                          {doc.owner[0]}
                        </div>
                        <span className="text-sm text-navy-700">{doc.owner}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <RiskBadge level={doc.riskLevel} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-navy-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        {doc.policy}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-navy-700">{doc.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{doc.lastActivity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No documents match your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
