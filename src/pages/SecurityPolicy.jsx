import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Share2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SecurityPolicyCard from '../components/ui/SecurityPolicyCard';
import { mockDocuments } from '../data/mockData';
import { useToast } from '../components/ui/Toast';

export default function SecurityPolicy() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const doc = location.state?.doc || mockDocuments[0];
  const [applied, setApplied] = useState(false);

  const policy = {
    'Encryption': 'AES-256',
    'Authentication': 'Password + OTP',
    'Access Duration': '1 Hour',
    'Download Limit': '0 / View Only',
    'Watermark': 'Enabled',
    'Audit Logging': 'Enabled',
    'Recipient Verification': 'Required',
  };

  const handleApply = () => {
    setApplied(true);
    toast('Security policy applied successfully.', 'success');
  };

  return (
    <DashboardLayout title="Security Policy" subtitle={`Adaptive policy for ${doc.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span>AI Risk Analysis</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-navy-700 font-medium">Security Policy</span>
        </div>

        <SecurityPolicyCard doc={doc} policy={policy} onApply={handleApply} applied={applied} />

        {applied && (
          <div className="card p-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">Policy Active</h3>
                  <p className="text-sm text-slate-500">Your document is now protected. Ready to share securely.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast('Redirecting to secure share...', 'info');
                  navigate('/share', { state: { doc } });
                }}
                className="btn-primary"
              >
                <Share2 className="w-4 h-4" />
                Share Document
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
