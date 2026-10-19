import { Shield, ShieldCheck, Lock, Clock, Eye, Download, KeyRound, Stamp, Check } from 'lucide-react';
import RiskBadge from './RiskBadge';

const controlIcons = {
  'Encryption': Lock,
  'Authentication': KeyRound,
  'Access Duration': Clock,
  'Download Limit': Download,
  'Watermark': Stamp,
  'Audit Logging': Eye,
  'Recipient Verification': ShieldCheck,
};

export default function SecurityPolicyCard({ doc, policy, onApply, applied }) {
  const riskLevel = doc?.riskLevel || 'MEDIUM';

  return (
    <div className="card overflow-hidden animate-scale-in">
      <div className="px-6 py-5 bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Adaptive Security Policy</h3>
              <p className="text-sm text-white/60">{doc?.name || 'Document Policy'}</p>
            </div>
          </div>
          <div>
            <RiskBadge level={riskLevel} />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(policy || {}).map(([key, value]) => {
            const Icon = controlIcons[key] || Shield;
            return (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Icon className="w-4.5 h-4.5 text-primary-700" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-sm font-medium text-navy-700">{key}</span>
                </div>
                <span className="text-sm font-semibold text-navy-900">{value}</span>
              </div>
            );
          })}
        </div>

        {onApply && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100">
            {applied ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Security policy active and enforced for this document.</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Apply the AI-calculated adaptive policy to lock down this document.</p>
            )}
            <button
              onClick={onApply}
              disabled={applied}
              className="btn-primary"
            >
              {applied ? (
                <>
                  <Check className="w-4 h-4" />
                  Policy Applied
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Apply Policy
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
