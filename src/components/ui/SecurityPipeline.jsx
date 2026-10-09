import { Upload, ScanText, Search, Brain, ShieldCheck, Lock, Share2, UserCheck, FileText, Eye } from 'lucide-react';

const iconMap = {
  Upload, ScanText, Search, Brain, ShieldCheck, Lock, Share2, UserCheck, FileText, Eye,
};

export default function SecurityPipeline({ compact = false }) {
  const stages = [
    { label: 'Document Upload', icon: 'Upload' },
    { label: 'OCR / Text Extraction', icon: 'ScanText' },
    { label: 'Sensitive Info Detection', icon: 'Search' },
    { label: 'AI Risk Assessment', icon: 'Brain' },
    { label: 'Adaptive Security Policy', icon: 'ShieldCheck' },
    { label: 'Secure Document Storage', icon: 'Lock' },
    { label: 'Controlled Sharing', icon: 'Share2' },
    { label: 'Recipient Authentication', icon: 'UserCheck' },
    { label: 'Document Access', icon: 'FileText' },
    { label: 'Audit & Monitoring', icon: 'Eye' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {stages.map((stage, i) => {
          const Icon = iconMap[stage.icon];
          return (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                <Icon className="w-4 h-4 text-primary-700" />
                <span className="text-xs font-medium text-navy-700 whitespace-nowrap">{stage.label}</span>
              </div>
              {i < stages.length - 1 && (
                <div className="w-4 h-px bg-slate-300" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stages.map((stage, i) => {
        const Icon = iconMap[stage.icon];
        return (
          <div
            key={i}
            className="relative card p-4 hover:shadow-md transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="absolute top-3 right-3 text-xs font-bold text-slate-200">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center mb-3 group-hover:from-primary-100 group-hover:to-accent-100 transition-all">
              <Icon className="w-5 h-5 text-primary-700" />
            </div>
            <p className="text-sm font-medium text-navy-800 leading-tight">{stage.label}</p>
          </div>
        );
      })}
    </div>
  );
}
