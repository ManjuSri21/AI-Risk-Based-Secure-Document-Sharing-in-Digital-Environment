import { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function UploadZone({ onFileSelect, selectedFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleBrowse = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  if (selectedFile) {
    return (
      <div className="card p-8 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7 text-primary-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy-900 truncate">{selectedFile.name}</p>
            <p className="text-sm text-slate-400 mt-0.5">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Unknown type'}
            </p>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
        dragging
          ? 'border-primary-600 bg-primary-50 scale-[1.01]'
          : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.png,.docx"
        onChange={handleBrowse}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          dragging ? 'bg-primary-100 scale-110' : 'bg-primary-50'
        }`}>
          <UploadCloud className={`w-8 h-8 text-primary-700 ${dragging ? 'animate-bounce-subtle' : ''}`} />
        </div>
        <div>
          <p className="text-lg font-semibold text-navy-900">
            {dragging ? 'Drop your file here' : 'Drag & Drop your document here'}
          </p>
          <p className="text-sm text-slate-400 mt-1">or</p>
          <button className="btn-primary mt-3 pointer-events-none">
            Browse Files
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
          <span>PDF</span>
          <span>·</span>
          <span>JPG</span>
          <span>·</span>
          <span>PNG</span>
          <span>·</span>
          <span>DOCX</span>
          <span>·</span>
          <span>Max 10 MB</span>
        </div>
      </div>
    </div>
  );
}
