import { Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, Upload, ScanSearch, Gauge, Share2,
  Brain, Search, SlidersHorizontal, Clock, Eye, Check,
  Sparkles, KeyRound, Stamp, ShieldAlert,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import SecurityPipeline from '../components/ui/SecurityPipeline';
import { howItWorksSteps, featuresData, securityLevels } from '../data/mockData';

const stepIcons = { Upload, ScanSearch, Gauge, ShieldCheck, Share2 };
const featureIcons = { Brain, Search, SlidersHorizontal, Share2, Clock, Eye };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-300/30 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-40 left-1/3 w-72 h-72 bg-primary-100/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-6 animate-fade-in">
                <Sparkles className="w-3.5 h-3.5" />
                AI-POWERED DOCUMENT SECURITY
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 leading-tight mb-6 animate-slide-up">
                Share Sensitive Documents.
                <br />
                <span className="gradient-text">Without Losing Control.</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
                SecureShare AI analyzes document sensitivity, determines risk, and automatically recommends security controls before your document is shared.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Link to="/register" className="btn-primary text-base px-6 py-3">
                  Start Securing Documents
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how-it-works" className="btn-secondary text-base px-6 py-3">
                  Explore How It Works
                </a>
              </div>
            </div>

            {/* Hero Image with Floating Cards */}
            <div className="relative animate-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-600/10 rounded-3xl blur-2xl" />

              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                <img
                  src="https://images.pexels.com/photos/8640331/pexels-photo-8640331.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Glowing neon blue optical fibers representing a futuristic secure data network"
                  className="w-full h-[420px] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />
              </div>

              {/* Floating Card: AI Confidence */}
              <div className="absolute -top-5 -left-5 card p-4 shadow-xl animate-slide-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">AI Confidence</p>
                    <p className="text-2xl font-bold text-navy-900">94%</p>
                  </div>
                </div>
              </div>

              {/* Floating Card: Risk Score */}
              <div className="absolute -bottom-5 -right-5 card p-4 shadow-xl animate-slide-up" style={{ animationDelay: '650ms' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Risk Score</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-rose-600">92</p>
                      <span className="badge badge-high">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        HIGH
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge: Security Controls */}
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 card p-3 shadow-xl animate-slide-up hidden sm:block" style={{ animationDelay: '800ms' }}>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'OTP', icon: KeyRound },
                    { label: 'Watermark', icon: Stamp },
                    { label: 'Expiry', icon: Clock },
                  ].map((ctrl) => {
                    const Icon = ctrl.icon;
                    return (
                      <div key={ctrl.label} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-navy-700">{ctrl.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Metrics Section */}
      <section className="py-16 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Documents Protected' },
              { value: '98.7%', label: 'Risk Detection Accuracy' },
              { value: '3', label: 'Risk Levels' },
              { value: '24/7', label: 'Security Monitoring' },
            ].map((stat, i) => (
              <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <p className="text-4xl lg:text-5xl font-bold gradient-text mb-2">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Security That Adapts to Every Document
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Five intelligent steps from upload to secure sharing, each powered by AI-driven risk assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {howItWorksSteps.map((step, i) => {
              const Icon = stepIcons[step.icon] || ShieldCheck;
              return (
                <div key={i} className="relative">
                  {i < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary-100 to-transparent -translate-x-1/2 z-0" />
                  )}
                  <div className="relative card p-6 text-center hover:shadow-md transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="text-xs font-bold text-primary-700 mb-3">{step.num}</div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-primary-700" />
                    </div>
                    <h3 className="font-semibold text-navy-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Everything You Need to Share Securely
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Comprehensive AI-powered security features that protect your documents at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, i) => {
              const Icon = featureIcons[feature.icon] || ShieldCheck;
              return (
                <div
                  key={i}
                  className="card p-6 hover:shadow-lg transition-all duration-300 group animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center mb-4 group-hover:from-primary-100 group-hover:to-accent-200 transition-all">
                    <Icon className="w-6 h-6 text-primary-700" />
                  </div>
                  <h3 className="font-semibold text-navy-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Security Policies That Adapt to Risk
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Every document receives a tailored security policy based on its risk classification.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {securityLevels.map((level, i) => {
              const colorClasses = {
                emerald: { border: 'border-emerald-200', bg: 'from-emerald-50', header: 'text-emerald-700', dot: 'bg-emerald-500', badge: 'badge-low' },
                amber: { border: 'border-amber-200', bg: 'from-amber-50', header: 'text-amber-700', dot: 'bg-amber-500', badge: 'badge-medium' },
                rose: { border: 'border-rose-200', bg: 'from-rose-50', header: 'text-rose-700', dot: 'bg-rose-500', badge: 'badge-high' },
              };
              const c = colorClasses[level.color] || colorClasses.emerald;

              return (
                <div
                  key={i}
                  className={`card p-6 transition-all duration-300 animate-slide-up relative ${
                    level.prominent ? 'ring-2 ring-rose-300 shadow-lg scale-[1.02]' : 'hover:shadow-md'
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {level.prominent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md">
                      Most Secure
                    </div>
                  )}
                  <div className={`flex items-center gap-2 mb-4`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                    <span className={`badge ${c.badge}`}>{level.level}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-5">
                    Example: <span className="font-medium text-navy-700">{level.example}</span>
                  </p>
                  <div className="space-y-3">
                    {level.controls.map((ctrl, j) => (
                      <div key={j} className="flex items-center gap-2.5 text-sm text-navy-700">
                        <div className={`w-5 h-5 rounded-full ${c.bg} flex items-center justify-center`}>
                          <Check className={`w-3 h-3 ${c.header}`} />
                        </div>
                        {ctrl}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Pipeline Section */}
      <section className="py-20 bg-gradient-to-br from-navy-900 to-navy-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-accent-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">The Security Pipeline</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              A complete end-to-end security workflow from document upload to audit monitoring.
            </p>
          </div>
          <SecurityPipeline />
        </div>
      </section>

      {/* About / CTA Section */}
      <section id="about" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            SECURESHARE AI
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
            Intelligent. Risk-Aware. Secure Document Sharing.
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Protect sensitive documents with AI-powered risk assessment and adaptive security controls before they are shared.
          </p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
