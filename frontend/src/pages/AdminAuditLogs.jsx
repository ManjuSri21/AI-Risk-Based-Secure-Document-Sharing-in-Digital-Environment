import { useState, useEffect } from 'react';
import { Search, Download, Trash2, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AuditLogTable from '../components/ui/AuditLogTable';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { auditApi } from '../services/api';

const filterTabs = [
  { id: 'ALL', label: 'All' },
  { id: 'Success', label: 'Successful' },
  { id: 'Blocked', label: 'Blocked' },
];

const authActions = ['OTP Verified', 'Password Entered', 'Failed OTP', '2FA Challenge', '2FA Verification'];
const downloadActions = ['Downloaded', 'Unauthorized Download'];
const sharingActions = ['Shared', 'Link Expired'];

export default function AdminAuditLogs() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearedView, setIsClearedView] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getAdminLogs();
      const raw = res?.logs || [];
      const clearedAtStr = localStorage.getItem('admin_audit_logs_cleared_at');
      const clearedTime = clearedAtStr ? new Date(clearedAtStr).getTime() : 0;
      setIsClearedView(Boolean(clearedAtStr));

      const filteredRaw = clearedTime
        ? raw.filter((l) => new Date(l.timestamp || l.createdAt || 0).getTime() > clearedTime)
        : raw;

      const mapped = filteredRaw.map((l) => ({
        id: l._id || l.id,
        document: l.document || l.documentName || 'General',
        user: l.user?.name || l.userName || (typeof l.user === 'string' ? l.user : 'User'),
        action: l.action,
        result: l.result,
        risk: l.riskLevel || 'LOW',
        rawTimestamp: new Date(l.timestamp || l.createdAt || Date.now()).getTime(),
        timestamp: new Date(l.timestamp || l.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        ip: l.ipAddress || '127.0.0.1',
        details: l.details || '',
      }));
      setLogs(mapped);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    if (logs.length === 0) {
      toast('No audit logs to export', 'info');
      return;
    }
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'ID,Document,User,Action,Result,Risk,Timestamp,IP,Details\n' +
      logs.map((l) => `"${l.id}","${l.document}","${l.user}","${l.action}","${l.result}","${l.risk}","${l.timestamp}","${l.ip}","${l.details}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `secureshare-admin-audit-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all logs temporarily from current system view without deleting from MongoDB
  const handleClearAll = () => {
    const now = new Date().toISOString();
    localStorage.setItem('admin_audit_logs_cleared_at', now);
    setLogs([]);
    setIsClearedView(true);
    setShowClearModal(false);
    toast('Audit logs cleared from system view. Permanent records in MongoDB remain safely preserved.', 'success');
  };

  // Restore historical logs back to the view
  const handleRestoreView = () => {
    localStorage.removeItem('admin_audit_logs_cleared_at');
    setIsClearedView(false);
    fetchLogs();
    toast('Historical audit logs restored to system view.', 'info');
  };

  const filtered = logs.filter((log) => {
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
    <DashboardLayout title="System Audit Logs" subtitle="Centralized compliance audit trail & forensic event ledger" isAdmin>
      <div className="space-y-6">
        {/* Notice when logs are temporarily cleared from view */}
        {isClearedView && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-sky-50/90 border border-sky-200 rounded-2xl text-xs text-sky-900 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center shrink-0 text-sky-700">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p>
                <strong>System View Reset:</strong> Logs are cleared from this screen. All database records in MongoDB are preserved. Showing new incoming events only.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRestoreView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sky-300 text-sky-800 hover:bg-sky-100/80 font-semibold transition-all shrink-0 self-end sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore All Logs
            </button>
          </div>
        )}

        <div className="card p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search all admin & user activity logs..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchLogs}
                className="btn-secondary whitespace-nowrap text-xs py-2 px-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={logs.length === 0}
                className="btn-secondary whitespace-nowrap text-xs py-2 px-3"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                disabled={logs.length === 0}
                className="btn-secondary whitespace-nowrap text-xs py-2 px-3 text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Logs
              </button>
            </div>
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

        <AuditLogTable logs={filtered} isAdmin={true} />
      </div>

      {/* Confirmation Modal for Clearing Logs from View */}
      <Modal open={showClearModal} onClose={() => setShowClearModal(false)} title="Clear Logs from System View" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-6 h-6 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed">
              This will clear the logs displayed on this screen so you can start fresh. <strong>Permanent compliance records in MongoDB will not be deleted</strong> and can be restored at any time.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowClearModal(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="btn-danger text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear System View
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
