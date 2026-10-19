import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-slate-200 animate-scale-in overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
