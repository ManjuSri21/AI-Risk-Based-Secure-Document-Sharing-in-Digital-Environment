import { useState, useEffect } from 'react';
import {
  Search, FileText, Filter, AlertTriangle, ShieldAlert,
  Clock, Lock, Unlock, History, Calendar, Share2,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskBadge from '../components/ui/RiskBadge';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { adminApi } from '../services/api';

export default function AdminDocuments() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sharingFilter, setSharingFilter] = useState('ALL');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Audit Logs modal state
  const [auditDoc, setAuditDoc] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  // Restricted Investigation modal state
  const [investigateTargetDoc, setInvestigateTargetDoc] = useState(null);
  const [investigationJustification, setInvestigationJustification] = useState('');
  const [investigationCertified, setInvestigationCertified] = useState(false);
  const [investigating, setInvestigating] = useState(false);
  const [investigationResult, setInvestigationResult] = useState(null);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDocuments();
      if (res?.documents) {
        setDocs(res.documents);
      }
    } catch (err) {
      toast(err.message || 'Failed to fetch document metadata', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // Open Document Audit Logs
  const handleOpenAuditLogs = async (doc) => {
    setAuditDoc(doc);
    setLoadingAuditLogs(true);
    try {
      const res = await adminApi.getDocumentAuditLogs(doc.id);
      setAuditLogs(res?.logs || []);
    } catch (err) {
      toast(err.message || 'Failed to load document audit logs', 'error');
      setAuditLogs([]);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  // Submit Restricted Investigation Access Request
  const handleConfirmInvestigation = async (e) => {
    e.preventDefault();
    if (!investigationJustification || investigationJustification.trim().length < 5) {
      toast('Please provide a formal justification (minimum 5 characters)', 'warning');
      return;
    }
    if (!investigationCertified) {
      toast('You must certify that this investigation is authorized and compliant', 'warning');
      return;
    }

    setInvestigating(true);
    try {
      const res = await adminApi.investigateDocument(investigateTargetDoc.id, investigationJustification);
      toast('Authorized investigation access granted. Forensic audit log recorded.', 'success');
      setInvestigationResult(res?.investigation);
      setInvestigateTargetDoc(null);
      setInvestigationJustification('');
      setInvestigationCertified(false);
    } catch (err) {
      toast(err.message || 'Investigation authorization failed', 'error');
    } finally {
      setInvestigating(false);
    }
  };

  // Client-side filtering
  const filtered = docs.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.owner || '').toLowerCase().includes(search.toLowerCase());

    const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;

    const matchSharing =
      sharingFilter === 'ALL' ||
      (sharingFilter === 'Shared' && d.sharingStatus.startsWith('Shared')) ||
      (sharingFilter === 'Protected' && d.sharingStatus.includes('Protected')) ||
      (sharingFilter === 'Access Restricted' && d.sharingStatus === 'Access Restricted');

    return matchSearch && matchRisk && matchSharing;
  });

  return (
    <DashboardLayout
      title="Admin Document Monitoring & Privacy Oversight"
      subtitle="Cross-user metadata, risk assessment, and privacy oversight"
      isAdmin
    >
      <div className="space-y-6">
        {/* Privacy Enforcement Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-primary-950 to-navy-900 p-5 text-white shadow-md border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 border border-primary-400/30 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">Zero-Knowledge Admin Privacy Enforcement</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
                By default, document contents are shielded to respect user confidentiality. Administrators can monitor metadata, risk scores, and audit trails. The system does not verify document issuers or determine whether document contents are genuine.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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

        {/* Controls & Multi-Filter Bar */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by document name or owner..."
                className="input-field pl-10 text-sm"
              />
            </div>

            {/* Filter 1: Risk Level */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input-field cursor-pointer text-xs font-medium py-2 w-auto"
                title="Filter by AI Risk Level"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>


              {/* Filter 2: Sharing Status */}
              <select
                value={sharingFilter}
                onChange={(e) => setSharingFilter(e.target.value)}
                className="input-field cursor-pointer text-xs font-medium py-2 w-auto"
                title="Filter by Sharing Status"
              >
                <option value="ALL">All Sharing Statuses</option>
                <option value="Protected">Protected (Not Shared)</option>
                <option value="Shared">Active Shares</option>
                <option value="Access Restricted">Access Restricted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Monitored Documents Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Name</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Upload Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Risk Level</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sharing Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Time</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Governance Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      {/* Document Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy-900">{doc.name}</p>
                            <p className="text-xs text-slate-400">{doc.fileType || 'PDF'} · {doc.size}</p>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {(doc.owner || 'U')[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-navy-800">{doc.owner}</span>
                        </div>
                      </td>

                      {/* Upload Date */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5" title={doc.uploadDateTime || doc.uploadDate}>
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {doc.uploadDate}
                        </span>
                      </td>

                      {/* AI Risk Level */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={doc.riskLevel} />
                          <span className="text-xs text-slate-400 font-mono">({doc.riskScore}/100)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {doc.riskAssessmentMethod === 'ML_DECISION_TREE' ? 'ML decision tree' : 'Rule-based fallback'}
                        </p>
                      </td>

                      {/* Sharing Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                          doc.sharingStatus.startsWith('Shared')
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : doc.sharingStatus === 'Access Restricted'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Share2 className="w-3 h-3" />
                          {doc.sharingStatus}
                        </span>
                      </td>

                      {/* Expiry Time */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {doc.expiryTime}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. View Associated Audit Logs */}
                          <button
                            type="button"
                            onClick={() => handleOpenAuditLogs(doc)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-primary-700 hover:bg-slate-100 transition-colors"
                            title="View Associated Audit Logs"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* 2. Restricted Investigation Option (Confirmation Dialog required) */}
                          <button
                            onClick={() => {
                              setInvestigateTargetDoc(doc);
                              setInvestigationJustification('');
                              setInvestigationCertified(false);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Restricted Investigation Access (Authorized Only)"
                          >
                            <Lock className="w-4 h-4 text-amber-600" />
                          </button>

                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && !loading && (
            <div className="p-12 text-center">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No documents match the specified filters.</p>
              <p className="text-xs text-slate-400 mt-1">Adjust risk or sharing filters to broaden search.</p>
            </div>
          )}

          {loading && (
            <div className="p-12 text-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading document metadata...
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Associated Document Audit Logs */}
      <Modal
        open={!!auditDoc}
        onClose={() => setAuditDoc(null)}
        title={`Audit Trail: ${auditDoc?.name || ''}`}
        maxWidth="max-w-2xl"
      >
        {auditDoc && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-navy-900">Owner:</span> {auditDoc.owner}
              </div>
              <div>
                <span className="font-semibold text-navy-900">Risk Level:</span> {auditDoc.riskLevel}
              </div>
              <div>
                <span className="font-semibold text-navy-900">Sharing status:</span> {auditDoc.sharingStatus}
              </div>
            </div>

            {loadingAuditLogs ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Retrieving chronological audit logs...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No audit events currently recorded for this document.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log._id || log.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy-900">{log.action}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.result === 'Success'
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.result === 'Blocked'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {log.result}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-600">{log.details}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Actor: <strong className="text-slate-600">{log.userName || 'System'}</strong></span>
                      <span>IP: <code className="text-slate-600">{log.ipAddress || '127.0.0.1'}</code></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button onClick={() => setAuditDoc(null)} className="btn-secondary text-xs">
                Close Audit Logs
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: Restricted Investigation Access Confirmation Dialog */}
      <Modal
        open={!!investigateTargetDoc}
        onClose={() => setInvestigateTargetDoc(null)}
        title="Restricted Investigation Access Confirmation"
        maxWidth="max-w-lg"
      >
        {investigateTargetDoc && (
          <form onSubmit={handleConfirmInvestigation} className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p className="font-bold">Zero-Knowledge Privacy Policy Warning</p>
                <p>
                  Actual document contents are shielded by default. Accessing document contents is strictly restricted to authorized security investigations, data breach diagnostics, or forensic compliance inquiries.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>Target Document:</strong> {investigateTargetDoc.name}</div>
              <div><strong>Document Owner:</strong> {investigateTargetDoc.owner}</div>
              <div><strong>Current Risk:</strong> {investigateTargetDoc.riskLevel} ({investigateTargetDoc.riskScore}/100)</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Investigation Justification / Incident Ticket <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={investigationJustification}
                onChange={(e) => setInvestigationJustification(e.target.value)}
                rows={3}
                required
                placeholder="State the formal security investigation reason (e.g. 'Security Incident #4092: Suspicious external leak investigation authorized by CISO')..."
                className="input-field text-xs resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This explanation will be permanently recorded in the immutable audit log.
              </p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={investigationCertified}
                onChange={(e) => setInvestigationCertified(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                required
              />
              <span className="text-xs text-slate-600">
                I certify that this investigation is formally authorized and compliant with data privacy regulations. An immutable audit log entry will be generated.
              </span>
            </label>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setInvestigateTargetDoc(null)}
                className="btn-secondary text-xs"
                disabled={investigating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary bg-amber-600 hover:bg-amber-700 text-xs flex items-center gap-1.5"
                disabled={investigating}
              >
                {investigating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    Confirm & Unseal Content
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: Security Investigation Content Viewer */}
      <Modal
        open={!!investigationResult}
        onClose={() => setInvestigationResult(null)}
        title="Authorized Security Investigation Review"
        maxWidth="max-w-2xl"
      >
        {investigationResult && (
          <div className="space-y-4">
            {/* Watermark Banner */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                RESTRICTED INVESTIGATION ACCESS — AUDIT LOG RECORDED
              </span>
              <span className="text-[11px] text-rose-600 font-mono">
                {new Date(investigationResult.investigationTimestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Document:</span>
                <span className="font-semibold text-navy-900">{investigationResult.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner:</span>
                <span className="font-semibold text-navy-900">{investigationResult.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Investigator:</span>
                <span className="font-semibold text-navy-900">{investigationResult.investigatedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Justification:</span>
                <span className="text-navy-900 italic">&quot;{investigationResult.justification}&quot;</span>
              </div>
            </div>

            {/* Extracted Content / Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Extracted Content & Findings</h4>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto">
                {investigationResult.extractedSummary}
              </div>
            </div>

            {/* Detected Sensitive Information Tags */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Detected Sensitive Entities (PII)</h4>
              <div className="flex flex-wrap gap-1.5">
                {investigationResult.sensitiveInfo && investigationResult.sensitiveInfo.length > 0 ? (
                  investigationResult.sensitiveInfo.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No sensitive entities detected</span>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInvestigationResult(null)}
                className="btn-primary text-xs"
              >
                Close & Reseal Document
              </button>
            </div>
          </div>
        )}
      </Modal>


    </DashboardLayout>
  );
}
