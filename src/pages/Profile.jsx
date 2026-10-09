import { useState } from 'react';
import {
  User, Mail, ShieldCheck, Smartphone, Bell, Monitor, Lock,
  KeyRound, LogOut, ChevronRight, BadgeCheck,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useToast } from '../components/ui/Toast';

function ToggleSwitch({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        on ? 'bg-primary-700' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
          on ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export default function Profile() {
  const { toast } = useToast();
  const [toggles, setToggles] = useState({
    twoFactor: true,
    loginNotifications: true,
    sessionManagement: false,
  });

  const toggle = (key) => {
    setToggles({ ...toggles, [key]: !toggles[key] });
    toast(`${key === 'twoFactor' ? 'Two-factor authentication' : key === 'loginNotifications' ? 'Login notifications' : 'Session management'} ${!toggles[key] ? 'enabled' : 'disabled'}`, 'success');
  };

  const securitySettings = [
    { key: 'twoFactor', label: 'Two-factor authentication', desc: 'Require a second verification step at login', icon: Smartphone },
    { key: 'loginNotifications', label: 'Login notifications', desc: 'Get notified of new login attempts', icon: Bell },
    { key: 'sessionManagement', label: 'Session management', desc: 'Monitor and manage active sessions', icon: Monitor },
  ];

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account and security settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="card overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-primary-700 via-primary-800 to-accent-700" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                M
              </div>
              <div className="pb-2 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-navy-900">Manju</h2>
                  <BadgeCheck className="w-5 h-5 text-primary-700" />
                </div>
                <p className="text-sm text-slate-400">Document Owner</p>
              </div>
              <button className="btn-secondary">
                <User className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-navy-900">manju@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Role</p>
                  <p className="text-sm font-medium text-navy-900">Document Owner</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Member Since</p>
                  <p className="text-sm font-medium text-navy-900">Jan 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy-900 mb-5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-700" />
            Security Settings
          </h3>
          <div className="space-y-3">
            {securitySettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{setting.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{setting.desc}</p>
                    </div>
                  </div>
                  <ToggleSwitch on={toggles[setting.key]} onChange={() => toggle(setting.key)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy-900 mb-5">Account Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-900">Change Password</p>
                  <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
            <button
              onClick={() => toast('Logged out (demo)', 'info')}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-rose-50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-rose-700">Logout</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sign out of your account</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-300" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
