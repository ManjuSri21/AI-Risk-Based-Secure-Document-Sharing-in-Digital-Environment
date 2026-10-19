import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Check, User,
  KeyRound, Clock, ArrowLeft, Smartphone
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { authApi } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  // 2FA state
  const [is2FA, setIs2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFaEmail, setTwoFaEmail] = useState('');
  const [twoFaNotice, setTwoFaNotice] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    if (!is2FA) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [is2FA]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);

    try {
      const res = await authApi.login(form.email, form.password, role);
      setLoading(false);

      if (res.requires2FA) {
        setTempToken(res.tempToken);
        setTwoFaEmail(res.email || form.email);
        setTwoFaNotice(res.message || 'Two-factor authentication code sent.');
        setIs2FA(true);
        setTimer(300);
        toast(res.message || '2FA code sent to your registered email.', 'info');
        return;
      }

      toast(`Welcome back, ${res.user?.name || 'User'}!`, 'success');
      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      toast(err.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const clean = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast('Please enter the full 6-digit verification code', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verify2FALogin(tempToken, code);
      setLoading(false);
      toast(`2FA verified! Welcome back, ${res.user?.name || 'User'}!`, 'success');
      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      toast(err.message || 'Invalid or expired verification code', 'error');
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-600/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">SecureShare</span>
              <span className="text-xl font-bold gradient-text-teal ml-1.5">AI</span>
            </div>
          </Link>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Secure Document Sharing,<br />Powered by AI.
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-md">
            Intelligent risk assessment, adaptive security policies, and complete audit trails for every document.
          </p>

          <div className="space-y-4">
            {[
              'AI-powered document risk classification',
              'Adaptive security policies per risk level',
              'Two-factor authentication & active session controls',
              'Immutable forensic audit trails',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5 justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-navy-900">SecureShare <span className="gradient-text">AI</span></span>
            </Link>
          </div>

          <div className="card p-8 animate-scale-in">
            {!is2FA ? (
              <>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Welcome Back</h2>
                <p className="text-sm text-slate-500 mb-6">Sign in to your secure document account.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.remember}
                        onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <span className="text-xs text-slate-400">Secure AES-256 Auth</span>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('user')}
                        className={`py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                          role === 'user'
                            ? 'border-2 border-primary-600 bg-primary-50/60 text-primary-700 font-semibold shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                        }`}
                      >
                        <User className={`w-5 h-5 ${role === 'user' ? 'text-primary-600' : 'text-slate-400'}`} />
                        <span className="text-sm">User</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                          role === 'admin'
                            ? 'border-2 border-primary-600 bg-primary-50/60 text-primary-700 font-semibold shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                        }`}
                      >
                        <ShieldCheck className={`w-5 h-5 ${role === 'admin' ? 'text-primary-600' : 'text-slate-400'}`} />
                        <span className="text-sm">Admin</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2.5">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-700 hover:text-primary-800 font-semibold">
                      Register
                    </Link>
                  </p>
                  <div>
                    <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors inline-block">
                      Back to home
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* 2FA Verification View */
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900">Two-Factor Authentication</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the 6-digit verification code sent to <span className="font-semibold text-navy-900">{twoFaEmail}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-primary-50/70 border border-primary-100 text-xs text-primary-800 text-center">
                  {twoFaNotice}
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-5">
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`login-otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all bg-white"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-medium">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Code expires in {formatTimer(timer)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Verify & Sign In
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIs2FA(false)}
                      className="text-xs text-slate-500 hover:text-navy-900 flex items-center gap-1 font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="text-xs text-primary-700 hover:text-primary-800 font-semibold"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
