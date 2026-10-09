import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Filter, FileText, Eye, Share2, BarChart3, Trash2, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskBadge from '../components/ui/RiskBadge';
import Modal from '../components/ui/Modal';
import { mockDocuments } from '../data/mockData';
import { useToast } from '../components/ui/Toast';

export default function Repository() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewDoc, setViewDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [docs, setDocs] = useState(mockDocuments);

  const filtered = docs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;
    const matchType = typeFilter === 'ALL' || d.type === typeFilter;
    return matchSearch && matchRisk && matchType;
  });

  const handleDelete = () => {
    setDocs(docs.filter((d) => d.id !== deleteDoc.id));
    toast(`${deleteDoc.name} deleted`, 'success');
    setDeleteDoc(null);
  };

  return (
    <DashboardLayout title="My Secure Documents" subtitle="Manage your protected documents">
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
                placeholder="Search documents..."
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field cursor-pointer w-auto"
              >
                <option value="ALL">All Types</option>
                <option value="PDF">PDF</option>
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
                <option value="DOCX">DOCX</option>
              </select>
              <button onClick={() => navigate('/upload')} className="btn-primary whitespace-nowrap">
                <Upload className="w-4 h-4" />
                Upload New
              </button>
            </div>
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <div key={doc.id} className="card p-5 hover:shadow-md transition-all duration-300 group animate-slide-up">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-primary-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{doc.type} · {doc.size}</p>
                </div>
                <RiskBadge level={doc.riskLevel} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Security Status</span>
                  <span className="font-medium text-navy-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    {doc.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Risk Score</span>
                  <span className="font-semibold text-navy-900">{doc.riskScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Last Modified</span>
                  <span className="text-slate-400">{doc.lastModified}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
                <button onClick={() => setViewDoc(doc)} className="p-2 rounded-lg text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/risk-analysis', { state: { doc } })} className="p-2 rounded-lg text-slate-400 hover:text-accent-600 hover:bg-accent-50 transition-all" title="Analyze">
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/share', { state: { doc } })} className="p-2 rounded-lg text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/security-policy', { state: { doc } })} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Policy">
                  <ShieldCheck className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteDoc(doc)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-auto" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents found matching your filters.</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal open={!!viewDoc} onClose={() => setViewDoc(null)} title="Document Details" maxWidth="max-w-lg">
        {viewDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary-700" />
              </div>
              <div>
                <p className="font-semibold text-navy-900">{viewDoc.name}</p>
                <p className="text-sm text-slate-400">{viewDoc.type} · {viewDoc.size}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-400">Risk Level</p>
                <div className="mt-1"><RiskBadge level={viewDoc.riskLevel} /></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-400">Risk Score</p>
                <p className="text-lg font-bold text-navy-900 mt-1">{viewDoc.riskScore}/100</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-400">Status</p>
                <p className="text-sm font-medium text-navy-700 mt-1">{viewDoc.status}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-400">AI Confidence</p>
                <p className="text-sm font-medium text-navy-700 mt-1">{viewDoc.aiConfidence}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sensitive Information</p>
              <div className="flex flex-wrap gap-2">
                {viewDoc.sensitiveInfo.map((info, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-navy-700">{info}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteDoc} onClose={() => setDeleteDoc(null)} title="Delete Document">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <p className="text-sm text-rose-700">
              Are you sure you want to delete <span className="font-semibold">{deleteDoc?.name}</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteDoc(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-primary bg-rose-600 hover:bg-rose-700">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
