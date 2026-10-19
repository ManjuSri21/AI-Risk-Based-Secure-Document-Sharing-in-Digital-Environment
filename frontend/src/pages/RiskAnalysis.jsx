import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert, FileText, Check, Brain, ChevronRight,
  KeyRound, Lock, Clock, Stamp, Download, Eye, ShieldCheck, Info,
  AlertTriangle, ShieldOff,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskScore from '../components/ui/RiskScore';
import RiskBadge from '../components/ui/RiskBadge';
import { useToast } from '../components/ui/Toast';

export default function RiskAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const doc = location.state?.doc || null;

  if (!doc) {
    return (
      <DashboardLayout title="AI Risk Assessment" subtitle="Document analysis">
        <div className="max-w-xl mx-auto mt-12 card p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">No Document Selected</h2>
          <p className="text-sm text-slate-500">Please upload a document to run AI risk assessment and policy generation.</p>
          <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
            Upload Document
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const riskLevel = (doc.riskLevel || 'LOW').toUpperCase();

  // Deduplicate and ensure all detected entities for identity documents are included
  const rawSensitive = Array.isArray(doc.sensitiveInfo) && doc.sensitiveInfo.length > 0
    ? [...doc.sensitiveInfo]
    : Array.isArray(doc.detectedEntities) && doc.detectedEntities.length > 0
      ? [...doc.detectedEntities]
      : [];

  const docName = (doc.name || doc.originalName || '').toLowerCase();
  const docType = (doc.documentType || '').toLowerCase();
  const isPan = docType.includes('pan') || docName.includes('pan') || rawSensitive.some(s => /pan/i.test(s));
  const isAadhaar = docType.includes('aadhaar') || docType.includes('aadhar') || docName.includes('aadhaar') || docName.includes('aadhar') || rawSensitive.some(s => /aadhaar|aadhar/i.test(s));
  const isBank = docType.includes('bank') || docName.includes('bank') || docName.includes('statement') || rawSensitive.some(s => /bank|financial|account/i.test(s));
  const isMarksheet = docType.includes('marksheet') || docType.includes('academic') || docName.includes('marksheet') || docName.includes('grade');

  const sensitiveItems = [...rawSensitive];

  if (isPan) {
    if (!sensitiveItems.some(s => /pan/i.test(s))) sensitiveItems.unshift('PAN Number');
    if (!sensitiveItems.some(s => /name/i.test(s))) sensitiveItems.push('Name');
    if (!sensitiveItems.some(s => /birth|dob/i.test(s))) sensitiveItems.push('Date of Birth');
  } else if (isAadhaar) {
    if (!sensitiveItems.some(s => /aadhaar|aadhar/i.test(s))) sensitiveItems.unshift('Aadhaar Number');
    if (!sensitiveItems.some(s => /name/i.test(s))) sensitiveItems.push('Name');
    if (!sensitiveItems.some(s => /birth|dob/i.test(s))) sensitiveItems.push('Date of Birth');
    if (!sensitiveItems.some(s => /address/i.test(s))) sensitiveItems.push('Residential Address');
  } else if (isBank) {
    if (!sensitiveItems.some(s => /account/i.test(s))) sensitiveItems.unshift('Account Number');
    if (!sensitiveItems.some(s => /name/i.test(s))) sensitiveItems.push('Name');
    if (!sensitiveItems.some(s => /financial|balance/i.test(s))) sensitiveItems.push('Bank & Financial Details');
  } else if (isMarksheet) {
    if (!sensitiveItems.some(s => /student|record/i.test(s))) sensitiveItems.unshift('Student Record / Academic ID');
    if (!sensitiveItems.some(s => /name/i.test(s))) sensitiveItems.push('Student Name');
  }

  const riskExplanations = {
    HIGH: {
      icon: ShieldAlert,
      iconColor: 'text-rose-500',
      title: 'Why is this document high risk?',
      description: 'This document contains critical personally identifiable information (PII) and sensitive identity attributes. Unauthorized access could lead to identity theft, financial fraud, or privacy violations.',
    },
    MEDIUM: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      title: 'Why is this document medium risk?',
      description: 'This document contains some personally identifiable information or sensitive data. While not critically dangerous, unauthorized access could still compromise privacy or be misused.',
    },
    LOW: {
      icon: ShieldOff,
      iconColor: 'text-emerald-500',
      title: 'Why is this document low risk?',
      description: 'This document contains minimal or no personally identifiable information. The risk of identity theft or privacy violation from this document is low.',
    },
  };

  const explanation = riskExplanations[riskLevel] || riskExplanations.LOW;
  const ExplanationIcon = explanation.icon;

  const recommendations = [
    { label: 'OTP Verification', value: riskLevel === 'LOW' ? 'Optional' : 'Recommended', icon: KeyRound, color: riskLevel === 'LOW' ? 'emerald' : 'amber' },
    { label: 'Password Protection', value: riskLevel === 'LOW' ? 'Optional' : 'Required', icon: Lock, color: riskLevel === 'LOW' ? 'emerald' : 'rose' },
    { label: 'Access Expiry', value: riskLevel === 'HIGH' ? '1 Hour' : riskLevel === 'MEDIUM' ? '24 Hours' : '7 Days', icon: Clock, color: 'primary' },
    { label: 'Watermark', value: riskLevel === 'LOW' ? 'Optional' : 'Required', icon: Stamp, color: riskLevel === 'LOW' ? 'emerald' : 'rose' },
    { label: 'Download', value: riskLevel === 'HIGH' ? 'Restricted' : riskLevel === 'MEDIUM' ? 'Limited' : 'Allowed', icon: Download, color: riskLevel === 'HIGH' ? 'rose' : riskLevel === 'MEDIUM' ? 'amber' : 'emerald' },
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

        {/* Risk Score + Why This Risk Level */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-6 flex flex-col items-center justify-center">
            <h3 className="font-semibold text-navy-900 mb-6">Risk Score</h3>
            <RiskScore score={doc.riskScore} size={180} label={null} />
          </div>

          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ExplanationIcon className={`w-5 h-5 ${explanation.iconColor}`} />
              <h3 className="font-semibold text-navy-900">{explanation.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {explanation.description}
            </p>

            {doc.policyReason && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-50 border border-primary-100 mb-5">
                <Info className="w-4 h-4 text-primary-700 shrink-0 mt-0.5" />
                <p className="text-xs text-primary-700">{doc.policyReason}</p>
              </div>
            )}

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sensitive Information Detected</p>
              {sensitiveItems.length > 0 ? (
                sensitiveItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-navy-700">{item}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ShieldOff className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-500">No sensitive data patterns were detected in this document.</span>
                </div>
              )}
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
