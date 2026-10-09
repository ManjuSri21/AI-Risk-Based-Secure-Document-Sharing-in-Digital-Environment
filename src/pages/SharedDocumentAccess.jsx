import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, FileText, Lock, KeyRound, Eye, Download, Stamp,
  Clock, ArrowRight, Check, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { mockDocuments } from '../data/mockData';
import { useToast } from '../components/ui/Toast';

export default function SharedDocumentAccess() {
  const { toast } = useToast();
  const doc = mockDocuments[0];
  const [stage, setStage] = useState('password');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(3542);
  const [otpTimer, setOtpTimer] = useState(300);

  useEffect(() => {
    if (stage !== 'granted') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'otp') return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const handlePassword = (e) => {
    e.preventDefault();
    if (!password) {
      toast('Please enter the password', 'warning');
      return;
    }
    toast('Password verified', 'success');
    setStage('otp');
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

  const handleOtp = (e) => {
    e.preventDefault();
    if (otp.some((d) => !d)) {
      toast('Please enter all 6 digits', 'warning');
      return;
    }
    toast('OTP verified successfully!', 'success');
    setStage('granted');
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

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
          <span className="text-xs text-slate-400">Protected Document Access</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {stage === 'granted' ? (
            /* Document Preview */
            <div className="card overflow-hidden animate-scale-in">
              <div className="px-6 py-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">{doc.name}</span>
                </div>
                <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  HIGH RISK
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-sm text-amber-700 font-medium">
                    Access expires in <span className="font-bold">{mins}:{String(secs).padStart(2, '0')}</span>
                  </span>
                </div>

                <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] text-5xl font-bold text-navy-900 rotate-[-30deg] select-none">
                    SECURESHARE AI · {doc.owner}
                  </div>
                  <FileText className="w-16 h-16 text-primary-400 mx-auto mb-3 relative z-10" />
                  <p className="text-sm text-slate-500 relative z-10">Document preview (watermarked)</p>
                  <p className="text-xs text-slate-400 mt-1 relative z-10">{doc.name} · {doc.size}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                    <Download className="w-4 h-4 text-rose-500" />
                    <span className="text-sm text-slate-600">Downloads disabled</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                    <Stamp className="w-4 h-4 text-primary-700" />
                    <span className="text-sm text-slate-600">Watermark enabled</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Session ID: SS-A1B2C3</span>
                  <Link to="/" className="text-sm text-primary-700 hover:text-primary-700 font-medium">
                    Exit
                  </Link>
                </div>
              </div>
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
                  <span className="badge badge-high">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    HIGH RISK — PROTECTED
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 border border-primary-100 mb-6">
                <AlertCircle className="w-4 h-4 text-primary-700 shrink-0" />
                <p className="text-xs text-primary-700">
                  This document is protected by SecureShare AI security controls.
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
                  <button type="submit" className="btn-primary w-full py-3">
                    Verify Password
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {stage === 'otp' && (
                <form onSubmit={handleOtp} className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Enter OTP Code</label>
                    <p className="text-xs text-slate-400 mb-3">A 6-digit code was sent to your email</p>
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
                  <button type="submit" className="btn-primary w-full py-3">
                    <KeyRound className="w-4 h-4" />
                    Verify OTP
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
