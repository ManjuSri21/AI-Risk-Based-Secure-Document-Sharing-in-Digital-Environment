import {
  CheckCircle2, XCircle, AlertTriangle, Eye, UserCheck, User,
  ShieldCheck, Download, Share2, KeyRound, ScrollText, Globe
} from 'lucide-react';

const actionIcons = {
  'Viewed': Eye,
  'OTP Verified': KeyRound,
  'Password Entered': KeyRound,
  'Shared': Share2,
  'Access Attempt': AlertTriangle,
  'Analyzed': CheckCircle2,
  'Failed OTP': XCircle,
  'Downloaded': Download,
  'Risk Assessed': CheckCircle2,
  'Uploaded': CheckCircle2,
  'Unauthorized Download': XCircle,
  'Link Expired': AlertTriangle,
  'Logged In': UserCheck,
  'Login Notification': Eye,
  'Account Created': UserCheck,
  'Profile Updated': UserCheck,
  'Security Settings Updated': KeyRound,
  'Session Terminated': XCircle,
  '2FA Challenge': KeyRound,
  '2FA Verification': KeyRound,
};

const resultStyles = {
  Success: 'badge-success',
  Blocked: 'badge-danger',
  Warning: 'badge-warning',
};

export default function AuditLogTable({ logs = [] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-400">
                  <ScrollText className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-navy-900">No Audit Events Found</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    The audit trail is currently clean. New security and access events will be logged here in real time.
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const Icon = actionIcons[log.action] || CheckCircle2;
                const isAdminUser =
                  log.userRole === 'admin' ||
                  (log.user && String(log.user).toLowerCase().includes('admin')) ||
                  (log.action && String(log.action).toLowerCase().includes('admin'));

                return (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-600 font-mono whitespace-nowrap">{log.timestamp}</span>
                    </td>

                    {/* User with Admin / User Logo */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        {isAdminUser ? (
                          <div
                            className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0 shadow-2xs"
                            title="Administrator Account"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-700" />
                          </div>
                        ) : (
                          <div
                            className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs"
                            title="User Account"
                          >
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                          <span className="text-sm font-semibold text-navy-900 leading-none">
                            {log.user}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide ${
                              isAdminUser
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isAdminUser ? 'ADMIN' : 'USER'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Document */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-navy-700 font-medium">{log.document}</span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm text-navy-700">{log.action}</span>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{log.ip || '127.0.0.1'}</span>
                      </div>
                    </td>

                    {/* Result */}
                    <td className="px-5 py-4">
                      <span className={`badge ${resultStyles[log.result] || 'badge-success'}`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
