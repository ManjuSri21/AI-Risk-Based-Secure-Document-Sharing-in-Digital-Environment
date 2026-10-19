import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { authApi } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', agree: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast('Please fill in all fields', 'warning');
      return;
    }
    if (form.password !== form.confirm) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (!form.agree) {
      toast('Please agree to the secure document sharing policies', 'warning');
      return;
    }
    setLoading(true);

    try {
      const res = await authApi.register(form.name, form.email, form.password, role);
      setLoading(false);
      toast(`Account created successfully as ${role === 'admin' ? 'Administrator' : 'User'}! Welcome to SecureShare AI.`, 'success');
      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
      toast(err.message || 'Registration failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-800 via-navy-800 to-navy-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
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
            Start Protecting Your<br />Documents Today.
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-md">
            Join thousands of users who secure their sensitive documents with AI-powered risk assessment.
          </p>

          <div className="space-y-4">
            {[
              'Personal & Administrator role governance',
              'AI risk analysis on every upload',
              'Secure links with OTP and expiry controls',
              'Complete forensic audit trails for all activities',
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

      {/* Right Register Form */}
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
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Create Account</h2>
            <p className="text-sm text-slate-500 mb-6">Get started with secure document sharing.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
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
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
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

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="••••••••"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-2.5 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
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
                    className={`py-2.5 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
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

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500 mt-0.5"
                />
                <span className="text-xs text-slate-600">
                  I agree to secure document sharing policies
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center space-y-2">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-700 hover:text-primary-800 font-semibold">
                  Sign in
                </Link>
              </p>
              <div>
                <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors inline-block">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
