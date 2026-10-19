import { FileText, Eye, Share2, Trash2, BarChart3 } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function DocumentTable({ documents, onView, onShare, onAnalyze, onDelete, showOwner = false }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="card p-10 text-center space-y-2">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-1" />
        <h4 className="font-semibold text-navy-900 text-sm">No Documents Yet</h4>
        <p className="text-xs text-slate-400">Upload your first document to run AI risk assessment and generate adaptive security policies.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              {showOwner && <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>}
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Accessed</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5 text-primary-700" style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <RiskBadge level={doc.riskLevel} />
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-navy-700">{doc.status}</span>
                </td>
                {showOwner && <td className="px-5 py-4"><span className="text-sm text-navy-700">{doc.owner}</span></td>}
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-500">{doc.lastAccessed}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {onView && (
                      <button onClick={() => onView(doc)} className="p-2 rounded-lg text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {onAnalyze && (
                      <button onClick={() => onAnalyze(doc)} className="p-2 rounded-lg text-slate-400 hover:text-accent-700 hover:bg-accent-50 transition-all" title="Analyze">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    )}
                    {onShare && (
                      <button onClick={() => onShare(doc)} className="p-2 rounded-lg text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all" title="Share">
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(doc)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
