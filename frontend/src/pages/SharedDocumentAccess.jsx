import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileText, Lock, KeyRound, Download, Stamp,
  Clock, ArrowRight, Check, AlertCircle, Copy, ExternalLink,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import RiskBadge from '../components/ui/RiskBadge';
import { useToast } from '../components/ui/Toast';
import { sharesApi } from '../services/api';

export default function SharedDocumentAccess() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Input for entering token manually when no token in URL
  const [tokenInput, setTokenInput] = useState('');
  const [myShares, setMyShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);

  const [doc, setDoc] = useState({
    name: 'Protected Document',
    size: 'Unknown size',
    type: 'Document',
    owner: 'Verified User',
    riskLevel: 'HIGH',
    downloadPerm: 'View Only',
    downloadCount: 0,
    watermark: true,
  });

  const [stage, setStage] = useState('loading');
  const [accessError, setAccessError] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(300);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewError, setPreviewError] = useState('');
  const otpRequestRef = useRef({ token: null, promise: null });

  // Load user shares if on main portal screen without token
  useEffect(() => {
    if (!token) {
      setLoadingShares(true);
      sharesApi.getMyShares()
        .then((res) => {
          if (res?.shares) setMyShares(res.shares);
        })
        .catch((err) => console.warn('Could not load user shares:', err))
        .finally(() => setLoadingShares(false));
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    const fetchInfo = async () => {
      if (!token) {
        setStage('gateway');
        return;
      }

      setStage('loading');
      try {
        const res = await sharesApi.getInfo(token);
        if (isMounted && res?.share) {
          const share = res.share;
          setHasPassword(share.hasPassword);
          setDoc({
            name: share.document?.name || 'Protected Document',
            size: share.document?.sizeFormatted || 'Unknown size',
            type: share.document?.fileType || 'Document',
            owner: share.document?.ownerName || 'Verified User',
            riskLevel: share.document?.riskLevel || 'HIGH',
            downloadPerm: share.downloadPerm || 'View Only',
            downloadCount: share.downloadCount || 0,
            watermark: share.controls?.watermark ?? true,
          });
          setExpiresAt(share.expiresAt);
          setCountdown(Math.max(0, Math.floor((new Date(share.expiresAt).getTime() - Date.now()) / 1000)));

          if (share.hasPassword) {
            setStage('password');
          } else if (share.requireOtp) {
            if (otpRequestRef.current.token !== token) {
              otpRequestRef.current = { token, promise: null };
            }
            if (!otpRequestRef.current.promise) {
              otpRequestRef.current.promise = sharesApi.requestOtp(token);
            }
            await otpRequestRef.current.promise;
            if (isMounted) {
              setOtpTimer(300);
              setStage('otp');
            }
          } else {
            setAccessToken(share.accessToken);
            setStage('granted');
          }
        } else if (isMounted) {
          setAccessError('Share information could not be loaded. Check the link and try again.');
          setStage('error');
        }
      } catch (err) {
        if (isMounted) {
          setAccessError(err.message || 'Unable to load this secure-share link.');
          setStage('error');
        }
      }
    };
    fetchInfo();
    return () => { isMounted = false; };
  }, [token]);

  useEffect(() => {
    if (stage !== 'granted' || !expiresAt) return;
    const interval = setInterval(() => {
      setCountdown(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, expiresAt]);

  useEffect(() => {
    if (stage !== 'granted' || !accessToken || !token) return undefined;

    const controller = new AbortController();
    let objectUrl;
    setPreviewUrl('');
    setPreviewType('');
    setPreviewError('');
    sharesApi.getContent(token, accessToken, { signal: controller.signal })
      .then((file) => {
        objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setPreviewType(file.type);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setPreviewError(error.message || 'Unable to load the shared document.');
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [stage, accessToken, token]);

  useEffect(() => {
    if (stage !== 'otp') return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const handleManualUnlock = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      toast('Please enter a share link or token', 'warning');
      return;
    }
    let extracted = tokenInput.trim();
    if (extracted.includes('token=')) {
      extracted = extracted.split('token=')[1].split('&')[0];
    }
    setSearchParams({ token: extracted });
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      toast('Please enter the password', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await sharesApi.verifyPassword(token, password);
      if (res?.requireOtp === false) {
        toast('Password verified!', 'success');
        setAccessToken(res.accessToken);
        setStage('granted');
      } else {
        toast(res.message || 'A verification code was sent to the recipient email.', 'success');
        setOtpTimer(300);
        setStage('otp');
      }
    } catch (err) {
      toast(err.message || 'Could not verify the password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = hasPassword
        ? await sharesApi.verifyPassword(token, password)
        : await sharesApi.requestOtp(token, true);
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        setStage('granted');
      } else {
        setOtp(['', '', '', '', '', '']);
        setOtpTimer(300);
        toast(response.message || 'A new verification code was sent.', 'success');
      }
    } catch (err) {
      toast(err.message || 'Could not send a new verification code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const isDownloadAllowed = doc.downloadPerm && doc.downloadPerm !== 'View Only';
    if (!isDownloadAllowed || !token || !accessToken) return;

    try {
      const file = await sharesApi.downloadContent(token, accessToken);
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDoc((prev) => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (error) {
      toast(error.message || 'Unable to download this document.', 'error');
    }
  };

  const handleOtpChange = (i, val) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) {
      const next = document.getElementById(`otp-${i + 1}`);
      next?.focus();
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast('Please enter the 6-digit code', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await sharesApi.verifyOtp(token, code);
      toast('Verification code accepted.', 'success');
      setAccessToken(res.accessToken);
      setStage('granted');
    } catch (err) {
      toast(err.message || 'Could not verify the code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const canPreview = previewType === 'application/pdf' || previewType.startsWith('image/') || previewType.startsWith('text/');

  // IF NO TOKEN: RENDER THE PORTAL GATEWAY DASHBOARD VIEW
  if (!token) {
    return (
      <DashboardLayout title="Secure Access" subtitle="Zero-trust document decryption gateway & verification portal">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Token Unlock Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Unlock Shared Document</h3>
                <p className="text-xs text-slate-500">Enter a secure share link or access token received via email/message</p>
              </div>
            </div>

            <form onSubmit={handleManualUnlock} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste secure link or enter share token..."
                  className="input-field pl-10 w-full"
                />
              </div>
              <button type="submit" className="btn-primary sm:w-auto py-2.5 px-6">
                <ShieldCheck className="w-4 h-4" />
                Access Document
              </button>
            </form>
          </div>

          {/* Active Shares Section */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy-900">Your Active Secure Links</h3>
                <p className="text-xs text-slate-500">Click any link below to test zero-trust verification and viewer</p>
              </div>
              <button
                onClick={() => {
                  setLoadingShares(true);
                  sharesApi.getMyShares().then((r) => setMyShares(r.shares || [])).finally(() => setLoadingShares(false));
                }}
                className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingShares ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {myShares.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-navy-900">No active links created yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you share documents from your repository, their access gates will be listed here for one-click testing.
                </p>
                <button
                  onClick={() => navigate('/share')}
                  className="btn-secondary text-xs mx-auto mt-2"
                >
                  Go to Share Document
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myShares.map((s) => (
                  <div key={s.id || s.shareToken} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-navy-900">{s.documentName}</span>
                          <RiskBadge level={s.documentRisk} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Recipient: <span className="font-mono text-slate-600">{s.recipientEmail}</span> · Token: <span className="font-mono text-slate-600">{s.shareToken?.slice(0, 10)}...</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/shared-access?token=${s.shareToken}`);
                          toast('Link copied to clipboard', 'info');
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link
                      </button>
                      <button
                        onClick={() => setSearchParams({ token: s.shareToken })}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Test Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zero-Trust Architecture Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-semibold text-sm text-navy-900 mb-1">1. Password Challenge</h4>
              <p className="text-xs text-slate-500">
                Shared out-of-band via WhatsApp to protect against unauthorized link intercepts.
              </p>
            </div>

            <div className="card p-5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <KeyRound className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-semibold text-sm text-navy-900 mb-1">2. Dynamic 2FA OTP</h4>
              <p className="text-xs text-slate-500">
                Single-use 6-digit cryptographic code delivered to verified recipient with a 5-minute expiry timer.
              </p>
            </div>

            <div className="card p-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Stamp className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-semibold text-sm text-navy-900 mb-1">3. Watermarked Decryption</h4>
              <p className="text-xs text-slate-500">
                In-memory stream decryption with forensic recipient watermark and download restriction enforcement.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // IF TOKEN IS PROVIDED: RENDER VERIFICATION / DOCUMENT VIEWER
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-navy-900">SecureShare <span className="gradient-text">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-primary-700 hover:text-primary-800 font-medium"
            >
              ← Back to Access Gateway
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">Protected Document Access</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {stage === 'granted' ? (
            /* Document Preview */
            <div className="card overflow-hidden animate-scale-in">
              <div className="px-6 py-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <span className="font-semibold truncate max-w-[220px]">{doc.name}</span>
                </div>
                <RiskBadge level={doc.riskLevel} />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-sm text-amber-700 font-medium">
                    Access expires in <span className="font-bold">{mins}:{String(secs).padStart(2, '0')}</span>
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 relative overflow-hidden min-h-[260px] flex flex-col justify-center">
                  {doc.watermark && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center opacity-[0.12] text-2xl font-bold text-navy-900 rotate-[-25deg] select-none pointer-events-none">
                      SECURESHARE AI · {doc.owner} · {new Date().toLocaleDateString()}
                    </div>
                  )}
                  {previewError ? (
                    <div className="p-6 text-center">
                      <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                      <p className="text-sm text-rose-700">{previewError}</p>
                    </div>
                  ) : !previewUrl ? (
                    <p className="text-sm text-slate-500 text-center py-12">Loading the protected document...</p>
                  ) : canPreview && previewType.startsWith('image/') ? (
                    <img src={previewUrl} alt={doc.name} className="max-h-[60vh] max-w-full mx-auto object-contain relative z-0" />
                  ) : canPreview ? (
                    <iframe
                      src={doc.downloadPerm === 'View Only' && previewType === 'application/pdf'
                        ? `${previewUrl}#toolbar=0&navpanes=0`
                        : previewUrl}
                      title={`Preview of ${doc.name}`}
                      className="w-full h-[60vh] border-0 rounded-lg bg-white relative z-0"
                    />
                  ) : (
                    <div className="p-8 text-center relative z-20">
                      <FileText className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-navy-900">{doc.name}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        This {doc.type} file cannot be previewed in the browser.
                        {doc.downloadPerm !== 'View Only' ? ' Use Download File to open it.' : ' The sender has disabled downloading.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {(() => {
                    const perm = doc.downloadPerm || "View Only";
                    if (perm === "View Only") {
                      return (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                          <Download className="w-4 h-4 text-rose-500" />
                          <span className="text-xs text-slate-600">Downloads disabled (View Only)</span>
                        </div>
                      );
                    }
                    const count = doc.downloadCount || 0;
                    let max = Infinity;
                    if (perm === "1 Time Download") max = 1;
                    else if (perm === "2 Times Download") max = 2;
                    else if (perm === "3 Times Download") max = 3;
                    const limitReached = count >= max;
                    if (limitReached) {
                      return (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100">
                          <Download className="w-4 h-4 text-rose-500" />
                          <span className="text-xs font-semibold text-rose-700">Download Limit Reached ({count}/{max})</span>
                        </div>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={!previewUrl}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors font-medium text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download File {max !== Infinity ? `(${count}/${max})` : "(Unlimited)"}</span>
                      </button>
                    );
                  })()}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Token: {token?.slice(0, 12)}...</span>
                  <button
                    onClick={() => setSearchParams({})}
                    className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                  >
                    Exit to Gateway
                  </button>
                </div>
              </div>
            </div>
          ) : stage === 'loading' ? (
            <div className="card p-8 text-center animate-scale-in">
              <ShieldCheck className="w-10 h-10 text-primary-600 mx-auto mb-3 animate-pulse" />
              <h1 className="text-xl font-bold text-navy-900">Verifying secure link</h1>
              <p className="text-sm text-slate-500 mt-2">Loading protected document details...</p>
            </div>
          ) : stage === 'error' ? (
            <div className="card p-8 text-center animate-scale-in">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-navy-900">Unable to access document</h1>
              <p className="text-sm text-slate-500 mt-2">{accessError}</p>
              <button
                onClick={() => setSearchParams({})}
                className="inline-flex items-center gap-2 mt-6 text-sm text-primary-700 hover:text-primary-800 font-medium"
              >
                Return to Access Gateway
              </button>
            </div>
          ) : (
            <div className="card p-8 animate-scale-in">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-xl font-bold text-navy-900">Protected Document</h1>
                <p className="text-sm text-slate-400 mt-1">{doc.name}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <RiskBadge level={doc.riskLevel} />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 border border-primary-100 mb-6">
                <AlertCircle className="w-4 h-4 text-primary-700 shrink-0" />
                <p className="text-xs text-primary-700">
                  This document is protected by SecureShare AI zero-trust security controls.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`flex items-center gap-2 ${stage === 'password' ? 'text-primary-700' : 'text-emerald-600'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${stage === 'password' ? 'bg-primary-100 text-primary-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {stage === 'password' ? '1' : <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-medium">Password</span>
                </div>
                <div className="w-8 h-px bg-slate-200" />
                <div className={`flex items-center gap-2 ${stage === 'otp' ? 'text-primary-700' : 'text-slate-400'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${stage === 'otp' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'}`}>
                    2
                  </div>
                  <span className="text-xs font-medium">OTP</span>
                </div>
                <div className="w-8 h-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-400">
                    3
                  </div>
                  <span className="text-xs font-medium">Access</span>
                </div>
              </div>

              {stage === 'password' && (
                <form onSubmit={handlePassword} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Enter Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter document password"
                        className="input-field pl-10"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Password'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {stage === 'otp' && (
                <form onSubmit={handleOtp} className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Enter OTP Code</label>
                    <p className="text-xs text-slate-400 mb-3">A 6-digit code was emailed to the recipient. It expires in 5 minutes.</p>
                    <div className="flex gap-2 justify-between">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                          className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600 font-medium">
                        OTP expires in {formatTime(otpTimer)}
                      </span>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                    <KeyRound className="w-4 h-4" />
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" onClick={handleResendOtp} disabled={loading} className="w-full text-sm text-primary-700 hover:text-primary-800 font-medium disabled:opacity-50">
                    Resend verification code
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
