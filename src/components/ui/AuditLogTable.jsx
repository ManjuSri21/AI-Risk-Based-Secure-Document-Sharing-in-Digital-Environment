import { CheckCircle2, XCircle, AlertTriangle, Eye, UserCheck, Download, Share2, KeyRound } from 'lucide-react';

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
};

const resultStyles = {
  Success: 'badge-success',
  Blocked: 'badge-danger',
  Warning: 'badge-warning',
};

export default function AuditLogTable({ logs }) {
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
            {logs.map((log) => {
              const Icon = actionIcons[log.action] || CheckCircle2;
              return (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600 font-mono">{log.timestamp}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-navy-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-navy-700">{log.document}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-navy-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-500 font-mono">{log.ip}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${resultStyles[log.result] || 'badge-success'}`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
