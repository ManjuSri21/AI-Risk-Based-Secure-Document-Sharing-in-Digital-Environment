import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShieldAlert, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';
import { auditApi, getStoredUser } from '../../services/api';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const mapLogToType = (log) => {
  if (log.result === 'Blocked') return 'alert';
  if (log.result === 'Warning' || log.action?.includes('Suspended')) return 'warning';
  if (log.result === 'Success' && (log.action?.includes('Verified') || log.action?.includes('Logged In'))) return 'success';
  return 'info';
};

const READ_STORAGE_KEY = 'secureshare_read_notifications';
const getStoredReadIds = () => {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (error) {
    console.warn('Failed to load notification read state:', error);
    return new Set();
  }
};

const saveStoredReadIds = (set) => {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
  } catch (error) {
    console.warn('Failed to save notification read state:', error);
  }
};

export default function Topbar({ title, subtitle, isAdmin = false }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = getStoredUser();

  const fetchRealAlerts = useCallback(async () => {
    try {
      const res = isAdmin
        ? await auditApi.getAdminLogs({ limit: 6 })
        : await auditApi.getMyLogs({ limit: 6 });

      if (res?.logs && Array.isArray(res.logs)) {
        const readIds = getStoredReadIds();
        const mapped = res.logs.slice(0, 6).map((log) => {
          const id = String(log.id || log._id);
          return {
            id,
            type: mapLogToType(log),
            title: log.action || 'Security Event',
            message: log.details || `${log.action} recorded for ${log.document || log.user || 'system'}`,
            time: formatTimeAgo(log.timestamp || log.date),
            read: readIds.has(id),
          };
        });
        setNotifications(mapped);
      }
    } catch {
      // Backend request error
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchRealAlerts();
    const interval = setInterval(fetchRealAlerts, 45000);
    return () => clearInterval(interval);
  }, [fetchRealAlerts]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markOneAsRead = (id) => {
    const readIds = getStoredReadIds();
    readIds.add(id);
    saveStoredReadIds(readIds);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
  };

  const notificationTone = {
    success: { className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    info: { className: 'bg-blue-50 text-blue-700', icon: Clock3 },
    warning: { className: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
    alert: { className: 'bg-rose-50 text-rose-700', icon: ShieldAlert },
  };

  const displayName = isAdmin ? 'Admin' : (currentUser?.name || 'User');
  const displayRole = isAdmin ? 'System Administrator' : (currentUser?.role === 'admin' ? 'Administrator' : 'Document Owner');
  const avatarLetter = (displayName[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="lg:ml-0 ml-12">
          <h1 className="text-xl font-bold text-navy-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={toggleNotifications}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all"
              aria-label="Toggle notifications"
            >
              <Bell className="w-5 h-5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 top-14 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-100">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">Notifications</p>
                    <p className="text-xs text-slate-400">{unreadCount} unread</p>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center space-y-1">
                      <p className="text-sm font-medium text-navy-900">No new notifications</p>
                      <p className="text-xs text-slate-400">All system security events normal</p>
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const Icon = notificationTone[item.type]?.icon || Clock3;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => markOneAsRead(item.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-100 transition-colors ${
                            item.read ? 'bg-white' : 'bg-primary-50/40 hover:bg-primary-50'
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                              notificationTone[item.type]?.className || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-navy-900 truncate">{item.title}</p>
                              {!item.read && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
                            </div>
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.message}</p>
                            <div className="mt-2 text-[11px] text-slate-400">
                              <span>{item.time}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to={isAdmin ? '/admin/profile' : '/profile'}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-100 hover:opacity-80 transition-opacity"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-xs ${
                isAdmin
                  ? 'bg-gradient-to-br from-indigo-700 to-primary-700'
                  : 'bg-gradient-to-br from-primary-600 to-accent-600'
              }`}
            >
              {avatarLetter}
            </div>
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-sm font-semibold text-navy-900">{displayName}</p>
              <p className="text-xs text-slate-400">{displayRole}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
