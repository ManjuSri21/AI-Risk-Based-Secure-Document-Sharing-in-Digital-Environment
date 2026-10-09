import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Share2, Mail, Link2, QrCode, Lock, KeyRound, Stamp, Clock,
  Download, Eye, Check, Copy, ChevronRight, FileText, Send,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskBadge from '../components/ui/RiskBadge';
import Modal from '../components/ui/Modal';
import { mockDocuments } from '../data/mockData';
import { useToast } from '../components/ui/Toast';

export default function ShareDocument() {
  const location = useLocation();
  const { toast } = useToast();
  const doc = location.state?.doc || mockDocuments[0];

  const [recipientEmail, setRecipientEmail] = useState('');
  const [accessMethod, setAccessMethod] = useState('link');
  const [expiry, setExpiry] = useState('1 Hour');
  const [downloadPerm, setDownloadPerm] = useState('View Only');
  const [controls, setControls] = useState({
    password: true,
    otp: true,
    watermark: true,
    expiry: true,
    downloadRestriction: true,
    audit: true,
  });
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareLink] = useState('secureshare.ai/share/8XK29P');

  const handleGenerate = () => {
    if (!recipientEmail) {
      toast('Please enter recipient email', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowModal(true);
      toast('Secure share link generated!', 'success');
    }, 1000);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://${shareLink}`);
    toast('Link copied to clipboard!', 'success');
  };

  const accessMethods = [
    { id: 'link', label: 'Secure Link', icon: Link2 },
    { id: 'qr', label: 'QR Code', icon: QrCode },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  const controlList = [
    { key: 'password', label: 'Password protection', icon: Lock },
    { key: 'otp', label: 'OTP verification', icon: KeyRound },
    { key: 'watermark', label: 'Watermark', icon: Stamp },
    { key: 'expiry', label: 'Access expiry', icon: Clock },
    { key: 'downloadRestriction', label: 'Download restriction', icon: Download },
    { key: 'audit', label: 'Audit logging', icon: Eye },
  ];

  return (
    <DashboardLayout title="Share Document" subtitle={`Securely share ${doc.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-navy-700 font-medium">Share Document</span>
        </div>

        {/* Document Info */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-navy-900">{doc.name}</p>
            <p className="text-xs text-slate-400">{doc.type} · {doc.size}</p>
          </div>
          <RiskBadge level={doc.riskLevel} />
        </div>

        {/* Recipient */}
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-navy-900">Recipient</h3>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Recipient Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Access Method</label>
            <div className="grid grid-cols-3 gap-3">
              {accessMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setAccessMethod(method.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      accessMethod === method.id
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-navy-900">Security Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {controlList.map((ctrl) => {
              const Icon = ctrl.icon;
              return (
                <label
                  key={ctrl.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    controls[ctrl.key] ? 'border-primary-200 bg-primary-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={controls[ctrl.key]}
                    onChange={(e) => setControls({ ...controls, [ctrl.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
                  />
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-navy-700">{ctrl.label}</span>
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">Access Expiry</label>
              <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="input-field cursor-pointer">
                <option>15 Minutes</option>
                <option>1 Hour</option>
                <option>6 Hours</option>
                <option>24 Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">Download Permission</label>
              <select value={downloadPerm} onChange={(e) => setDownloadPerm(e.target.value)} className="input-field cursor-pointer">
                <option>View Only</option>
                <option>Allow Download</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button onClick={handleGenerate} disabled={loading} className="btn-primary px-8 py-3">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Generate Secure Share Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setShowQR(false); }} title="Secure Link Generated" maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Link generated successfully</p>
              <p className="text-xs text-emerald-600 mt-0.5">This is a frontend demo link — not a real secure link.</p>
            </div>
          </div>

          {!showQR ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Secure Share Link</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-mono text-navy-700 truncate flex-1">{shareLink}</span>
                <button onClick={copyLink} className="p-1.5 rounded-lg text-primary-700 hover:bg-primary-50 transition-all">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <QRCodeSVG value={`https://${shareLink}`} size={180} level="H" />
              </div>
              <p className="text-sm text-slate-500">Scan QR code to access document</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Expiry</p>
              <p className="font-semibold text-navy-900 mt-0.5">{expiry}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Download</p>
              <p className="font-semibold text-navy-900 mt-0.5">{downloadPerm}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowQR(!showQR)} className="btn-secondary flex-1">
              <QrCode className="w-4 h-4" />
              {showQR ? 'Show Link' : 'Generate QR'}
            </button>
            <button onClick={copyLink} className="btn-secondary flex-1">
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
