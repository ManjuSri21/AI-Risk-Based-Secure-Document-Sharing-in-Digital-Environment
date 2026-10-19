import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, ShieldCheck, Smartphone, Bell, Monitor, Lock,
  KeyRound, LogOut, ChevronRight, BadgeCheck, Laptop,
  RefreshCw, Trash2, PowerOff
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { authApi, getStoredUser } from '../services/api';

function ToggleSwitch({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        on ? 'bg-primary-700' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  const [profile, setProfile] = useState({
    name: storedUser?.name || 'User',
    email: storedUser?.email || '',
    role: storedUser?.role === 'admin' ? 'System Administrator' : 'Document Owner',
    department: storedUser?.department || 'Document Security',
    joined: 'Jan 2026',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });

  const [toggles, setToggles] = useState({
    twoFactor: false,
    loginNotifications: true,
    sessionManagement: true,
  });

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const loadUserData = async () => {
    try {
      const res = await authApi.getMe();
      if (res?.user) {
        const u = res.user;
        setProfile({
          name: u.name || 'User',
          email: u.email || '',
          role: u.role === 'admin' ? 'System Administrator' : 'Document Owner',
          department: u.department || 'Document Security',
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2026',
        });
        setEditName(u.name || '');
        setEditEmail(u.email || '');

        if (u.securitySettings) {
          setToggles({
            twoFactor: Boolean(u.securitySettings.twoFactor),
            loginNotifications: u.securitySettings.loginNotifications !== false,
            sessionManagement: u.securitySettings.sessionManagement !== false,
          });
        }
      }
    } catch {
      // Keep stored user fallbacks
    }
  };

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await authApi.getSessions();
      if (res?.sessions) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.warn('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadUserData();
    loadSessions();
  }, []);

  const toggle = async (key) => {
    const nextVal = !toggles[key];
    const newSettings = { ...toggles, [key]: nextVal };
    setToggles(newSettings);
    setUpdatingSettings(true);

    try {
      await authApi.updateSecuritySettings(newSettings);
      const label = key === 'twoFactor'
        ? 'Two-factor authentication'
        : key === 'loginNotifications'
          ? 'Login notifications'
          : 'Session management';
      toast(`${label} ${nextVal ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to update security setting', 'error');
      // Rollback
      setToggles(toggles);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await authApi.revokeSession(sessionId);
      toast('Session terminated successfully', 'success');
      loadSessions();
    } catch (err) {
      toast(err.message || 'Failed to revoke session', 'error');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await authApi.revokeSession('all-other');
      toast('All other device sessions have been revoked', 'success');
      loadSessions();
    } catch (err) {
      toast(err.message || 'Failed to revoke other sessions', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({ name: editName, email: editEmail });
      setProfile((p) => ({ ...p, name: editName, email: editEmail }));
      setIsEditing(false);
      toast('Profile updated successfully', 'success');
    } catch (err) {
      toast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.current || !passForm.next) {
      toast('Please enter current and new passwords', 'warning');
      return;
    }
    if (passForm.next !== passForm.confirm) {
      toast('New passwords do not match', 'warning');
      return;
    }
    if (passForm.next.length < 6) {
      toast('Password must be at least 6 characters', 'warning');
      return;
    }

    try {
      await authApi.changePassword(passForm.current, passForm.next);
      setIsChangingPass(false);
      setPassForm({ current: '', next: '', confirm: '' });
      toast('Password changed successfully', 'success');
    } catch (err) {
      toast(err.message || 'Failed to change password', 'error');
    }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const securitySettings = [
    {
      key: 'twoFactor',
      label: 'Two-factor authentication',
      desc: 'Require a second verification step at login',
      icon: Smartphone,
    },
    {
      key: 'loginNotifications',
      label: 'Login notifications',
      desc: 'Get notified of new login attempts',
      icon: Bell,
    },
    {
      key: 'sessionManagement',
      label: 'Session management',
      desc: 'Monitor and manage active sessions',
      icon: Monitor,
    },
  ];

  return (
    <DashboardLayout title="Account Profile" subtitle="Manage your identity, credentials, and security controls">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="card overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-navy-900 via-primary-900 to-accent-900 relative" />
          <div className="px-6 pb-6 pt-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="-mt-14 relative z-10 shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md border-4 border-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="pt-2 sm:pt-0 sm:pb-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl font-bold text-navy-900 leading-tight">{profile.name}</h2>
                    <BadgeCheck className="w-5 h-5 text-primary-600 shrink-0" />
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-100">
                      {profile.role}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {profile.department || 'Document Security & Risk Governance'}
                  </p>
                </div>
              </div>
              <div className="sm:pb-1">
                <button onClick={() => setIsEditing(true)} className="btn-secondary">
                  <User className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Mail className="w-4 h-4 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="text-sm font-medium text-navy-900 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Security Clearance</p>
                  <p className="text-sm font-medium text-navy-900">{profile.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Member Since</p>
                  <p className="text-sm font-medium text-navy-900">{profile.joined}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-700" />
              Security Settings
            </h3>
            {updatingSettings && (
              <span className="text-xs text-primary-700 flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            )}
          </div>

          <div className="space-y-3">
            {securitySettings.map((setting) => {
              const Icon = setting.icon;
              const isEnabled = toggles[setting.key];
              return (
                <div
                  key={setting.key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isEnabled
                      ? 'border-primary-200/80 bg-primary-50/20'
                      : 'border-slate-100 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isEnabled ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{setting.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{setting.desc}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    on={isEnabled}
                    onChange={() => toggle(setting.key)}
                    disabled={updatingSettings}
                  />
                </div>
              );
            })}
          </div>

          {/* 2FA Status Notice */}
          {toggles.twoFactor && (
            <div className="mt-4 p-4 rounded-xl bg-primary-50/60 border border-primary-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-primary-900">Two-Factor Authentication is Active</h4>
                <p className="text-xs text-primary-700 mt-0.5">
                  Every sign-in to your account will require a one-time 6-digit verification code sent to your email (<span className="font-mono">{profile.email}</span>).
                </p>
              </div>
            </div>
          )}

          {/* Login Notification Notice */}
          {toggles.loginNotifications && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
              <Bell className="w-4 h-4 text-primary-700 shrink-0" />
              <span>Real-time email and audit notifications will alert you of any new login attempts from unrecognized devices.</span>
            </div>
          )}
        </div>

        {/* Workable Session Management Panel */}
        {toggles.sessionManagement && (
          <div className="card p-6 animate-scale-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary-700" />
                  Active Device Sessions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review and revoke access from browsers and devices logged into your account
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadSessions}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRevokeAllOtherSessions}
                    className="btn-secondary text-xs py-1.5 px-3 text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    Revoke Other Sessions
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {sessions.length === 0 ? (
                /* Fallback if no backend sessions yet */
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-navy-900">Current Device (Web Browser)</span>
                        <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Active Now
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">IP: 127.0.0.1 · Last active: Just now</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400">This Device</span>
                </div>
              ) : (
                sessions.map((sess, idx) => (
                  <div
                    key={sess.sessionId || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        sess.isCurrent ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sess.device?.includes('Mobile') ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-navy-900">
                            {sess.device || 'Computer'} · {sess.browser || 'Browser'}
                          </span>
                          {sess.isCurrent && (
                            <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          IP: <span className="font-mono text-slate-600">{sess.ip || '127.0.0.1'}</span> ·
                          Last active: {sess.lastActive ? new Date(sess.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(sess.sessionId)}
                        className="self-end sm:self-center text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy-900 mb-5">Account Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setIsChangingPass(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all text-left"
            >
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
              onClick={handleLogout}
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

      {/* Edit Profile Modal */}
      <Modal open={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile" maxWidth="max-w-md">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={isChangingPass} onClose={() => setIsChangingPass(false)} title="Change Password" maxWidth="max-w-md">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={passForm.current}
              onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={passForm.next}
              onChange={(e) => setPassForm({ ...passForm, next: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={passForm.confirm}
              onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsChangingPass(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

