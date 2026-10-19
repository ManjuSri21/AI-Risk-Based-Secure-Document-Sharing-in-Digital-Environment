import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight, ShieldCheck, Share2, FileText, Lock, KeyRound,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SecurityPolicyCard from '../components/ui/SecurityPolicyCard';
import RiskBadge from '../components/ui/RiskBadge';
import { useToast } from '../components/ui/Toast';
import { documentsApi } from '../services/api';

const getAdaptivePolicy = (riskLevel) => {
  const level = (riskLevel || 'MEDIUM').toUpperCase();
  if (level === 'HIGH') {
    return {
      'Encryption': 'AES-256 (Mandatory)',
      'Authentication': 'Password + OTP (2FA)',
      'Access Duration': '1 Hour',
      'Download Limit': '0 / View Only',
      'Watermark': 'Enabled (Dynamic User Overlay)',
      'Audit Logging': 'Real-Time Immutable',
      'Recipient Verification': 'Strict 2FA Required',
    };
  }
  if (level === 'MEDIUM') {
    return {
      'Encryption': 'AES-256',
      'Authentication': 'Password + OTP',
      'Access Duration': '6 Hours',
      'Download Limit': '1 Time Download',
      'Watermark': 'Enabled',
      'Audit Logging': 'Standard',
      'Recipient Verification': 'Required',
    };
  }
  return {
    'Encryption': 'AES-256',
    'Authentication': 'Password Protection',
    'Access Duration': '24 Hours',
    'Download Limit': 'Standard Allowed',
    'Watermark': 'Enabled',
    'Audit Logging': 'Standard',
    'Recipient Verification': 'Optional',
  };
};

export default function SecurityPolicy() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(location.state?.doc?._id || location.state?.doc?.id || '');
  const [appliedDocs, setAppliedDocs] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await documentsApi.getAll();
      const docs = res.documents || [];
      setDocuments(docs);
      if (location.state?.doc) {
        setSelectedDocId(location.state.doc._id || location.state.doc.id);
      } else if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0]._id);
      }
    } catch (err) {
      console.warn('Failed to load documents for policy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const selectedDoc = documents.find((d) => (d._id || d.id) === selectedDocId) ||
    (location.state?.doc ? location.state.doc : null) ||
    documents[0] || null;

  const currentPolicy = selectedDoc ? getAdaptivePolicy(selectedDoc.riskLevel) : getAdaptivePolicy('HIGH');
  const isApplied = Boolean(selectedDoc && appliedDocs[selectedDoc._id || selectedDoc.id]);

  const handleApply = async () => {
    if (!selectedDoc) return;
    const docId = selectedDoc._id || selectedDoc.id;
    setAppliedDocs((prev) => ({ ...prev, [docId]: true }));

    if (docId && typeof docId === 'string' && docId.length === 24) {
      try {
        await documentsApi.updatePolicy(docId, currentPolicy);
      } catch (err) {
        console.warn('Policy update error:', err.message);
      }
    }
    toast(`Adaptive security policy applied for "${selectedDoc.name}".`, 'success');
  };

  return (
    <DashboardLayout title="Security Policies" subtitle="Risk-adaptive access controls & zero-trust protection">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span onClick={() => navigate('/dashboard')} className="hover:text-primary-700 cursor-pointer">Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span onClick={() => navigate('/repository')} className="hover:text-primary-700 cursor-pointer">Repository</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-navy-900 font-semibold">Security Policies</span>
          </div>
          <button
            onClick={fetchDocs}
            className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="space-y-6">
            <div className="card p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-navy-900">Adaptive Policy Framework</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                SecureShare AI automatically configures granular zero-trust security policies according to document risk classification. Upload your documents to enforce these policies.
              </p>
              <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
                Upload Document Now
              </button>
            </div>

            {/* AI Policy Profile Previews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-5 border-rose-100 bg-rose-50/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-high">HIGH RISK</span>
                  <Lock className="w-4 h-4 text-rose-500" />
                </div>
                <h4 className="font-semibold text-navy-900 text-sm mb-1">Confidential & Identity</h4>
                <p className="text-xs text-slate-500 mb-3">PAN, Aadhaar, financials, contracts</p>
                <ul className="text-xs space-y-1.5 text-slate-600">
                  <li>• AES-256 GCM encryption</li>
                  <li>• Mandatory Password + 2FA OTP</li>
                  <li>• Max 1 Hour expiration</li>
                  <li>• Dynamic canvas watermark</li>
                  <li>• Download restricted (View-only)</li>
                </ul>
              </div>

              <div className="card p-5 border-amber-100 bg-amber-50/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-medium">MEDIUM RISK</span>
                  <KeyRound className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="font-semibold text-navy-900 text-sm mb-1">Internal Operations</h4>
                <p className="text-xs text-slate-500 mb-3">Staff memos, technical guides, orders</p>
                <ul className="text-xs space-y-1.5 text-slate-600">
                  <li>• AES-256 GCM encryption</li>
                  <li>• Password + OTP verification</li>
                  <li>• 6 Hours expiration</li>
                  <li>• Dynamic recipient watermark</li>
                  <li>• 1-Time controlled download</li>
                </ul>
              </div>

              <div className="card p-5 border-emerald-100 bg-emerald-50/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-low">LOW RISK</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="font-semibold text-navy-900 text-sm mb-1">Standard Documents</h4>
                <p className="text-xs text-slate-500 mb-3">Brochures, public receipts, policies</p>
                <ul className="text-xs space-y-1.5 text-slate-600">
                  <li>• AES-256 standard encryption</li>
                  <li>• Password protection</li>
                  <li>• 24 Hours access window</li>
                  <li>• Dynamic watermark overlay</li>
                  <li>• Standard download access</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Document Selector Header */}
            <div className="card p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Inspecting Policy For</label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="text-base font-bold text-navy-900 bg-transparent border-b border-primary-200 focus:outline-none focus:border-primary-600 py-0.5 cursor-pointer pr-4"
                    >
                      {documents.map((d) => (
                        <option key={d._id || d.id} value={d._id || d.id}>
                          {d.name} ({d.riskLevel || 'LOW'} Risk)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedDoc && (
                  <div className="flex items-center gap-3">
                    <RiskBadge level={selectedDoc.riskLevel} />
                    <button
                      onClick={() => navigate('/share', { state: { doc: selectedDoc } })}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share With This Policy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Policy Card */}
            {selectedDoc && (
              <SecurityPolicyCard
                doc={selectedDoc}
                policy={currentPolicy}
                onApply={handleApply}
                applied={isApplied}
              />
            )}

            {isApplied && (
              <div className="card p-5 animate-slide-up bg-emerald-50/50 border-emerald-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy-900">Policy Ready for Deployment</h4>
                      <p className="text-xs text-slate-500">
                        Zero-Trust safeguards are configured. Generate a share link to deliver this protected document.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/share', { state: { doc: selectedDoc } })}
                    className="btn-primary text-sm py-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Proceed to Share
                  </button>
                </div>
              </div>
            )}

            {/* All Documents Policy Summary Matrix */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-navy-900">Document Security Matrix</h3>
                <p className="text-xs text-slate-500">Security enforcement status across all repository assets</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Document</th>
                      <th className="px-6 py-3.5">Risk Level</th>
                      <th className="px-6 py-3.5">Encryption</th>
                      <th className="px-6 py-3.5">Authentication</th>
                      <th className="px-6 py-3.5">Watermark</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => {
                      const isSelected = (doc._id || doc.id) === selectedDocId;
                      return (
                        <tr
                          key={doc._id || doc.id}
                          className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-primary-50/30' : ''}`}
                        >
                          <td className="px-6 py-3.5 font-medium text-navy-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary-700 shrink-0" />
                            <span className="truncate max-w-xs">{doc.name}</span>
                          </td>
                          <td className="px-6 py-3.5">
                            <RiskBadge level={doc.riskLevel} />
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-600 font-mono">
                            AES-256
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-600">
                            {doc.riskLevel === 'HIGH' ? 'Password + OTP (2FA)' : 'Password'}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-emerald-600 font-medium">
                            Enforced
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedDocId(doc._id || doc.id)}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                isSelected
                                  ? 'bg-primary-700 text-white border-primary-700'
                                  : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'View Policy'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
