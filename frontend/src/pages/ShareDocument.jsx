import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Share2, Mail, Link2, QrCode, Lock, KeyRound, Stamp, MessageCircle, Smartphone,
  Check, Copy, FileText, Clock, Eye,
  Download, ExternalLink, Plus, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskBadge from '../components/ui/RiskBadge';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { documentsApi, sharesApi } from '../services/api';

export default function ShareDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [shares, setShares] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'active'

  const [selectedDocId, setSelectedDocId] = useState(location.state?.doc?._id || location.state?.doc?.id || '');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
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
  const [shareLink, setShareLink] = useState('');
  
  const loadData = async () => {
    setLoadingDocs(true);
    try {
      const [docsRes, sharesRes] = await Promise.allSettled([
        documentsApi.getAll(),
        sharesApi.getMyShares(),
      ]);

      let docsList = [];
      if (docsRes.status === 'fulfilled' && docsRes.value?.documents) {
        docsList = docsRes.value.documents.map((d) => ({
          ...d,
          id: d._id,
        }));
        setDocuments(docsList);
      }

      if (sharesRes.status === 'fulfilled' && sharesRes.value?.shares) {
        setShares(sharesRes.value.shares);
        // If arrived with no specific doc in state and shares exist, show active shares by default
        if (!location.state?.doc && sharesRes.value.shares.length > 0) {
          setActiveTab('active');
        }
      }

      // If document was passed via navigation, pick it; otherwise select first doc
      if (location.state?.doc) {
        setSelectedDocId(location.state.doc._id || location.state.doc.id);
        setActiveTab('new');
      } else if (docsList.length > 0 && !selectedDocId) {
        setSelectedDocId(docsList[0]._id || docsList[0].id);
      }
    } catch (err) {
      console.warn('Failed to load sharing data:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDoc = documents.find((d) => (d._id || d.id) === selectedDocId) ||
    (location.state?.doc && (location.state.doc._id === selectedDocId || location.state.doc.id === selectedDocId) ? location.state.doc : null) ||
    documents[0] || null;

  const controlList = [
    { key: 'password', label: 'Password Protection', icon: Lock },
    { key: 'otp', label: 'OTP Verification (2FA)', icon: KeyRound },
    { key: 'watermark', label: 'Dynamic Watermark', icon: Stamp },
    { key: 'expiry', label: 'Time-based Expiry', icon: Clock },
    { key: 'downloadRestriction', label: 'Download Restriction', icon: Download },
    { key: 'audit', label: 'Access Audit Logging', icon: Eye },
  ];

  const handleGenerate = async () => {
    if (!selectedDoc) {
      toast('Please select a document to share', 'warning');
      return;
    }
    if (!recipientEmail) {
      toast('Please enter recipient email', 'warning');
      return;
    }
    if (controls.password && !accessPassword) {
      toast('Please set an access password for the recipient', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await sharesApi.create({
        documentId: selectedDoc._id || selectedDoc.id,
        recipientEmail,
        recipientPhone,
        hasPassword: controls.password,
        password: controls.password ? accessPassword : '',
        requireOtp: controls.otp,
        expiry,
        downloadPerm,
        controls,
      });

      const fullLink = `${window.location.origin}/shared-access?token=${res.share.shareToken}`;
      setShareLink(fullLink);
            setShowModal(true);
      toast('Secure share link created successfully!', 'success');
      // Refresh active shares list
      loadData();
    } catch (error) {
      toast(error.message || 'Failed to create secure share', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (linkToCopy) => {
    const text = linkToCopy || shareLink;
    navigator.clipboard.writeText(text);
    toast('Share link copied to clipboard', 'info');
  };

  const handleSharePassword = (method, pwd = accessPassword, docName = selectedDoc?.name) => {
    const message = encodeURIComponent(
      `Password for secure document "${docName || 'Document'}": ${pwd}\n\nPlease check your email for the secure link.`
    );
    if (method === 'whatsapp') {
      const phoneClean = (recipientPhone || '').replace(/\D/g, '');
      const url = phoneClean
        ? `https://wa.me/${phoneClean}?text=${message}`
        : `https://wa.me/?text=${message}`;
      window.open(url, '_blank');
    }
  };

  return (
    <DashboardLayout title="Shared Documents" subtitle="Create and monitor risk-adaptive secure access links">
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Active Shared Links ({shares.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            Share a Document
          </button>
        </div>
        <button
          onClick={loadData}
          className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingDocs ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* TAB 1: Active Shared Links */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {shares.length === 0 ? (
            <div className="card p-10 text-center space-y-4 max-w-xl mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                <Share2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">No Active Share Links</h3>
              <p className="text-sm text-slate-500">
                You haven't generated any secure share links yet. Select a document from your repository to generate a protected, risk-adaptive link.
              </p>
              <button
                onClick={() => setActiveTab('new')}
                className="btn-primary mx-auto"
              >
                <Plus className="w-4 h-4" />
                Share Your First Document
              </button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-navy-900">Active Share Links</h3>
                  <p className="text-xs text-slate-500">Protected links governed by OTP, watermarking, and expiry controls</p>
                </div>
                <button
                  onClick={() => setActiveTab('new')}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Share
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Document</th>
                      <th className="px-6 py-3.5">Recipient</th>
                      <th className="px-6 py-3.5">Risk Tier</th>
                      <th className="px-6 py-3.5">Access Expiry</th>
                      <th className="px-6 py-3.5">Views / Downloads</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shares.map((share) => {
                      const link = `${window.location.origin}/shared-access?token=${share.shareToken}`;
                      return (
                        <tr key={share.id || share.shareToken} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 font-medium text-navy-900 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="truncate max-w-xs">{share.documentName}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                            {share.recipientEmail}
                          </td>
                          <td className="px-6 py-4">
                            <RiskBadge level={share.documentRisk} />
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {share.isExpired ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                                <Clock className="w-3.5 h-3.5" /> Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(share.expiresAt).toLocaleDateString()} {new Date(share.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <span className="font-semibold text-navy-900">{share.accessCount || 0}</span> views · <span className="font-semibold text-navy-900">{share.downloadCount || 0}</span> DLs
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => copyLink(link)}
                                title="Copy link"
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-primary-50 hover:text-primary-700 text-slate-600 transition-all"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                title="Open access gate"
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Share a Document Form */}
      {activeTab === 'new' && (
        <>
          {documents.length === 0 ? (
            <div className="card p-10 text-center space-y-4 max-w-xl mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-navy-900">No Documents in Repository</h2>
              <p className="text-sm text-slate-500">
                You need to upload at least one document before generating risk-adaptive secure share links.
              </p>
              <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
                Upload Document Now
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Document Selector Header */}
              <div className="card p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Document</label>
                      <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="text-base font-bold text-navy-900 bg-transparent border-b border-primary-200 focus:outline-none focus:border-primary-600 py-1 cursor-pointer pr-4"
                      >
                        {documents.map((d) => (
                          <option key={d._id || d.id} value={d._id || d.id}>
                            {d.name} ({d.riskLevel || 'LOW'} Risk - {d.sizeFormatted || 'PDF'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {selectedDoc && (
                    <div className="flex items-center gap-3">
                      <RiskBadge level={selectedDoc.riskLevel} />
                      <span className="text-xs text-slate-400 font-mono">
                        Score: {selectedDoc.riskScore !== undefined ? selectedDoc.riskScore : 50}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Details & Sharing Method */}
              <div className="card p-6 space-y-5">
                <h3 className="font-semibold text-navy-900">Recipient & Delivery Channel</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Recipient Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Direct link and OTP verification codes will be sent here.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Recipient Mobile (Optional)</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="input-field pl-10"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Useful for secondary password transmission via WhatsApp.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Primary Access Link Delivery</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'link', label: 'Copyable Link', icon: Link2 },
                      { key: 'email', label: 'Email Invite', icon: Mail },
                      { key: 'qr', label: 'Instant QR Code', icon: QrCode },
                    ].map((method) => {
                      const Icon = method.icon;
                      const active = accessMethod === method.key;
                      return (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => setAccessMethod(method.key)}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                            active
                              ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Security Controls */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-navy-900">Zero-Trust Security Controls</h3>
                  <span className="text-xs text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full font-medium">
                    AI Risk-Adaptive Enforcement
                  </span>
                </div>

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
                      <option>7 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Download Permission</label>
                    <select value={downloadPerm} onChange={(e) => setDownloadPerm(e.target.value)} className="input-field cursor-pointer">
                      <option value="View Only">View Only (No Downloads)</option>
                      <option value="1 Time Download">1 Time Download</option>
                      <option value="2 Times Download">2 Times Download</option>
                      <option value="3 Times Download">3 Times Download</option>
                      <option value="Unlimited Download">Unlimited Download</option>
                    </select>
                  </div>
                </div>

                {controls.password && (
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Access Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={accessPassword}
                        onChange={(e) => setAccessPassword(e.target.value)}
                        placeholder="Set strong access password for recipient"
                        className="input-field pl-10"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      For zero-trust security, the password should be shared over a separate communication channel (e.g. WhatsApp).
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/repository')}
                  className="btn-secondary"
                >
                  Back to Repository
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary px-8 py-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Protected Link...
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
          )}
        </>
      )}

      {/* Share Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Secure Share Link Generated" maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Protected link ready</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Verification codes and zero-trust safeguards are fully engaged.
              </p>
            </div>
          </div>

          {!showQR ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Secure Share Link</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-mono text-navy-700 truncate flex-1">{shareLink}</span>
                <button onClick={() => copyLink()} className="p-1.5 rounded-lg text-primary-700 hover:bg-primary-50 transition-all">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <QRCodeSVG value={shareLink} size={180} level="H" />
              </div>
              <p className="text-sm text-slate-500">Scan to open this document's secure access gateway</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Expiry</p>
              <p className="font-semibold text-navy-900 mt-0.5">{expiry}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Download Limit</p>
              <p className="font-semibold text-navy-900 mt-0.5">{downloadPerm}</p>
            </div>
          </div>

          {controls.password && accessPassword && (
            <div className="space-y-3">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                Send the password separately to the recipient via WhatsApp.
              </p>
              <div className="flex gap-3">
                <button onClick={() => handleSharePassword('whatsapp')} className="btn-secondary flex-1">
                  <MessageCircle className="w-4 h-4" />
                  Share via WhatsApp
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setShowQR(!showQR)} className="btn-secondary flex-1">
              <QrCode className="w-4 h-4" />
              {showQR ? 'Show Link' : 'Generate QR'}
            </button>
            <button onClick={() => copyLink()} className="btn-secondary flex-1">
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
