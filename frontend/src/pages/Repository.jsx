import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Upload, FileText, Eye, Share2, BarChart3, Trash2, ShieldCheck, Calendar, Filter } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskBadge from '../components/ui/RiskBadge';
import Modal from '../components/ui/Modal';
import { mockDocuments } from '../data/mockData';
import { useToast } from '../components/ui/Toast';
import { documentsApi } from '../services/api';

const isDocumentRestricted = (doc) =>
  ['Suspended', 'Rejected'].includes(doc.status) ||
  ['SUSPENDED', 'REJECTED'].includes(doc.documentStatus);

export default function Repository() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewDoc, setViewDoc] = useState(location.state?.viewDocument || null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [docs, setDocs] = useState(mockDocuments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await documentsApi.getAll();
        if (res.documents && res.documents.length > 0) {
          setDocs(res.documents);
        }
      } catch {
        // Fallback to mock documents smoothly
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    if (!viewDoc) return undefined;

    const controller = new AbortController();
    let objectUrl;
    setPreviewUrl('');
    setPreviewType('');
    setPreviewError('');
    setPreviewLoading(true);

    documentsApi.getFile(viewDoc._id || viewDoc.id, { signal: controller.signal })
      .then((file) => {
        objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setPreviewType(file.type);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setPreviewError(error.message || 'Unable to load this document.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setPreviewLoading(false);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [viewDoc]);

  const filtered = docs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;
    const matchType = typeFilter === 'ALL' || (d.type || d.fileType) === typeFilter;
    return matchSearch && matchRisk && matchType;
  });

  const handleDelete = async () => {
    const target = deleteDoc;
    const docId = target._id || target.id;
    setDocs((prev) => prev.filter((d) => (d._id || d.id) !== docId));
    setDeleteDoc(null);

    if (docId && typeof docId === 'string' && docId.length === 24) {
      try {
        await documentsApi.delete(docId);
      } catch (err) {
        console.warn('Delete notice:', err.message);
      }
    }
    toast(`${target.name} deleted`, 'success');
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return { bar: 'bg-rose-500', text: 'text-rose-600' };
      case 'MEDIUM': return { bar: 'bg-amber-500', text: 'text-amber-600' };
      case 'LOW': return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
      default: return { bar: 'bg-slate-400', text: 'text-slate-500' };
    }
  };

  return (
    <DashboardLayout title="My Secure Documents" subtitle="Manage your protected documents">
      <div className="space-y-6">
        {/* Risk Summary Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="card p-4 text-center border-l-4 border-l-primary-600">
            <p className="text-2xl font-bold text-primary-700">{docs.length}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Total Documents</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-l-rose-500">
            <p className="text-2xl font-bold text-rose-600">
              {docs.filter((d) => d.riskLevel === 'HIGH').length}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">High Risk</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-l-amber-500">
            <p className="text-2xl font-bold text-amber-600">
              {docs.filter((d) => d.riskLevel === 'MEDIUM').length}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">Medium Risk</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-l-emerald-500">
            <p className="text-2xl font-bold text-emerald-600">
              {docs.filter((d) => d.riskLevel === 'LOW').length}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">Low Risk</p>
          </div>
        </div>

        {/* Controls & Filter Bar */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="input-field pl-10 text-sm"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input-field cursor-pointer text-xs font-medium py-2 w-auto"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field cursor-pointer text-xs font-medium py-2 w-auto"
              >
                <option value="ALL">All Types</option>
                <option value="PDF">PDF</option>
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
                <option value="DOCX">DOCX</option>
              </select>
              <button onClick={() => navigate('/upload')} className="btn-primary whitespace-nowrap text-sm">
                <Upload className="w-4 h-4" />
                Upload New
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Name</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Size</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Risk Score</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Modified</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const riskColor = getRiskColor(doc.riskLevel);
                  const restricted = isDocumentRestricted(doc);
                  return (
                    <tr key={doc._id || doc.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      {/* Document Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-semibold text-navy-900 truncate max-w-[200px]">{doc.name}</p>
                        </div>
                      </td>

                      {/* Type / Size */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-600 font-medium">{doc.fileType || doc.type || 'PDF'}</span>
                        <span className="text-xs text-slate-400 ml-1.5">{'\u2022'} {doc.sizeFormatted || doc.size}</span>
                      </td>

                      {/* AI Risk Score with Progress Bar */}
                      <td className="px-4 py-3.5">
                        <div className="min-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-slate-400">AI Risk Score</span>
                            <span className={`text-xs font-bold ${riskColor.text}`}>{doc.riskScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${riskColor.bar}`}
                              style={{ width: `${Math.min(doc.riskScore, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${
                          restricted
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : doc.status === 'Approved' || doc.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {doc.status}
                        </span>
                      </td>

                      {/* Last Modified */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {doc.lastModified || doc.uploadDate || 'Recent'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (restricted) {
                                toast('Risk analysis is unavailable for suspended or rejected documents', 'warning');
                                return;
                              }
                              navigate('/risk-analysis', { state: { doc } });
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              restricted
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-accent-600 hover:bg-accent-50'
                            }`}
                            title="Analyze Risk"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (restricted) {
                                toast('Sharing is unavailable for suspended or rejected documents', 'error');
                                return;
                              }
                              navigate('/share', { state: { doc } });
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              restricted
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-primary-700 hover:bg-primary-50'
                            }`}
                            title="Share Document"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate('/security-policy', { state: { doc } })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Security Policy"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && !loading && (
            <div className="p-12 text-center">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No documents found matching your filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          )}

          {loading && (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading documents...
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      <Modal open={!!viewDoc} onClose={() => setViewDoc(null)} title={viewDoc ? `Viewing ${viewDoc.name}` : 'Document Preview'} maxWidth="max-w-5xl">
        {viewDoc && (
          <div className="space-y-4">
            {previewLoading && <p className="text-sm text-slate-500 text-center py-12">Loading your document...</p>}
            {previewError && <p className="text-sm text-rose-600 text-center py-8">{previewError}</p>}
            {previewUrl && previewType.startsWith('image/') && (
              <img src={previewUrl} alt={viewDoc.name} className="max-h-[70vh] max-w-full mx-auto object-contain" />
            )}
            {previewUrl && (previewType === 'application/pdf' || previewType.startsWith('text/')) && (
              <iframe
                src={previewUrl}
                title={`Preview of ${viewDoc.name}`}
                className="w-full h-[70vh] border border-slate-200 rounded-lg"
              />
            )}
            {previewUrl && !previewType.startsWith('image/') && previewType !== 'application/pdf' && !previewType.startsWith('text/') && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-4">This file type cannot be previewed in the browser. Open the original file to view it.</p>
                <a href={previewUrl} download={viewDoc.originalName || viewDoc.name} className="btn-primary inline-flex">
                  Download Document
                </a>
              </div>
            )}
            {previewUrl && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">
                  <RiskBadge level={viewDoc.riskLevel} />
                  <span className="ml-2">Risk score: {viewDoc.riskScore}/100</span>
                </span>
                <a href={previewUrl} download={viewDoc.originalName || viewDoc.name} className="text-sm text-primary-700 hover:text-primary-800 font-medium">
                  Download original
                </a>
              </div>
            )}
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
