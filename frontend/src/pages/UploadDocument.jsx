import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronRight, CheckCircle2, Loader2, Brain } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import UploadZone from '../components/ui/UploadZone';
import { useToast } from '../components/ui/Toast';
import { uploadSteps } from '../data/mockData';

import { documentsApi } from '../services/api';

export default function UploadDocument() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('PDF');
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnalyze = async () => {
    if (!file) {
      toast('Please select a document first', 'warning');
      return;
    }
    setProcessing(true);
    setCurrentStep(0);

    // Visual step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < uploadSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await documentsApi.upload(file, docName || file.name);
      clearInterval(stepInterval);
      setCurrentStep(uploadSteps.length - 1);
      setTimeout(() => {
        setProcessing(false);
        toast('Document analyzed successfully. Document authenticity is not checked.', 'success');
        navigate('/risk-analysis', {
          state: { doc: res.document },
        });
      }, 400);
    } catch (err) {
      clearInterval(stepInterval);
      setProcessing(false);
      toast(err.message || 'Upload failed. Please ensure backend is running.', 'error');
    }
  };

  if (processing) {
    return (
      <DashboardLayout title="Upload Document" subtitle="Analyzing your document with AI">
        <div className="flex items-center justify-center py-12">
          <div className="w-full max-w-lg">
            <div className="card p-8 animate-scale-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900">AI Processing in Progress</h3>
                <p className="text-sm text-slate-400 mt-1">{file?.name}</p>
              </div>

              <div className="space-y-4">
                {uploadSteps.map((step, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        isActive ? 'bg-primary-50 border border-primary-100' : isDone ? 'bg-emerald-50/50' : 'opacity-40'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-primary-700 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isDone ? 'text-emerald-700' : isActive ? 'text-primary-700' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-accent-600 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / uploadSteps.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  {Math.round(((currentStep + 1) / uploadSteps.length) * 100)}% complete
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Upload Document" subtitle="Secure a new document with AI risk analysis">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-navy-700 font-medium">Upload Document</span>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Secure a New Document</h2>
              <p className="text-sm text-slate-400">Upload your document for AI-powered risk assessment</p>
            </div>
          </div>
        </div>

        <UploadZone onFileSelect={setFile} selectedFile={file} />

        {file && (
          <>
            <div className="card p-6 space-y-5 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Document Name</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder={file.name}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="input-field cursor-pointer"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="JPG">JPG Image</option>
                    <option value="PNG">PNG Image</option>
                    <option value="DOCX">Word Document</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => { setFile(null); setDocName(''); }} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleAnalyze} className="btn-primary">
                <Brain className="w-4 h-4" />
                Analyze Document
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
