import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast('Welcome back! Redirecting to dashboard...', 'success');
      navigate('/dashboard');
    }, 1200);
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
              'OTP, encryption, and watermark controls',
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

      {/* Right Login Form */}
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
                <a href="#" className="text-sm text-primary-700 hover:text-primary-700 font-medium">
                  Forgot password?
                </a>
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

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-700 hover:text-primary-700 font-semibold">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/admin/dashboard" className="text-xs text-slate-400 hover:text-primary-700 transition-colors">
              Admin? Access admin dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
