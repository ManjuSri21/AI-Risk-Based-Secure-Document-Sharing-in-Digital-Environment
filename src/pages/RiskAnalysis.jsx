import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert, FileText, Check, Brain, ChevronRight,
  KeyRound, Lock, Clock, Stamp, Download, Eye, ShieldCheck, Info,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskScore from '../components/ui/RiskScore';
import RiskBadge from '../components/ui/RiskBadge';
import { mockDocuments } from '../data/mockData';
import { useToast } from '../components/ui/Toast';

export default function RiskAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const doc = location.state?.doc || mockDocuments[0];

  const recommendations = [
    { label: 'OTP Verification', value: 'Recommended', icon: KeyRound, color: 'amber' },
    { label: 'Password Protection', value: 'Required', icon: Lock, color: 'rose' },
    { label: 'Access Expiry', value: '1 Hour', icon: Clock, color: 'primary' },
    { label: 'Watermark', value: 'Required', icon: Stamp, color: 'rose' },
    { label: 'Download', value: 'Restricted', icon: Download, color: 'rose' },
    { label: 'Audit Logging', value: 'Enabled', icon: Eye, color: 'emerald' },
  ];

  const colorMap = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    primary: { bg: 'bg-primary-50', text: 'text-primary-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  };

  return (
    <DashboardLayout title="AI Risk Assessment" subtitle={`Analyzing ${doc.name}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-navy-700 font-medium">AI Risk Analysis</span>
        </div>

        {/* Header */}
        <div className="card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900 text-lg">{doc.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <RiskBadge level={doc.riskLevel} />
                <span className="text-xs text-slate-400">AI Confidence: <span className="font-semibold text-navy-700">{doc.aiConfidence}%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score + Why High Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-6 flex flex-col items-center justify-center">
            <h3 className="font-semibold text-navy-900 mb-6">Risk Score</h3>
            <RiskScore score={doc.riskScore} size={180} label={null} />
          </div>

          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-navy-900">Why is this document high risk?</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              This document contains multiple personally identifiable and sensitive identity attributes. Unauthorized access could lead to identity theft or privacy violations.
            </p>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sensitive Information Detected</p>
              {(doc.sensitiveInfo || mockDocuments[0].sensitiveInfo).map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-navy-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Security Recommendation */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-5 h-5 text-primary-700" />
            <h3 className="font-semibold text-navy-900">AI Security Recommendation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => {
              const Icon = rec.icon;
              const c = colorMap[rec.color] || colorMap.primary;
              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                      <Icon className={`w-4.5 h-4.5 ${c.text}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <span className="text-sm font-medium text-navy-700">{rec.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${c.text}`}>{rec.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => navigate('/repository')} className="btn-secondary">
            Back to Documents
          </button>
          <button
            onClick={() => {
              toast('Security policy generated!', 'success');
              navigate('/security-policy', { state: { doc } });
            }}
            className="btn-primary"
          >
            <ShieldCheck className="w-4 h-4" />
            Generate Security Policy
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
