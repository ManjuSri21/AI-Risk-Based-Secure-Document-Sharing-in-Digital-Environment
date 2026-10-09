import { FileText, Image, FileSpreadsheet, FileType } from 'lucide-react';
import RiskBadge from './RiskBadge';

const iconMap = {
  PDF: FileText,
  JPG: Image,
  PNG: Image,
  DOCX: FileType,
  XLSX: FileSpreadsheet,
};

export default function DocumentCard({ doc, onView, onShare, onAnalyze }) {
  const Icon = iconMap[doc.type] || FileText;

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-300 group animate-slide-up">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Icon className="w-6 h-6 text-primary-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy-900 truncate">{doc.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{doc.type} · {doc.size || '2.4 MB'}</p>
        </div>
        <RiskBadge level={doc.riskLevel} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-500">Status: <span className="font-medium text-navy-700">{doc.status}</span></span>
        <span className="text-xs text-slate-400">{doc.lastAccessed}</span>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        {onView && (
          <button onClick={() => onView(doc)} className="btn-ghost text-xs flex-1">
            View
          </button>
        )}
        {onAnalyze && (
          <button onClick={() => onAnalyze(doc)} className="btn-ghost text-xs flex-1">
            Analyze
          </button>
        )}
        {onShare && (
          <button onClick={() => onShare(doc)} className="btn-ghost text-xs flex-1">
            Share
          </button>
        )}
      </div>
    </div>
  );
}
