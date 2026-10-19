import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, FileText, Upload, Share2, ShieldCheck,
  ScrollText, User, LogOut, Menu, X, FileLock,
} from 'lucide-react';
import Logo from './Logo';

const userNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Documents', path: '/repository', icon: FileText },
  { label: 'Upload Document', path: '/upload', icon: Upload },
  { label: 'Shared Documents', path: '/share', icon: Share2 },
  { label: 'Secure Access', path: '/shared-access', icon: FileLock },
  { label: 'Security Policies', path: '/security-policy', icon: ShieldCheck },
  { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
  { label: 'Profile', path: '/profile', icon: User },
];

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: User },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  { label: 'Risk Monitoring', path: '/admin/risk-monitoring', icon: ShieldCheck },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  { label: 'Profile', path: '/admin/profile', icon: User },
];

export default function Sidebar({ isAdmin = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-slate-100">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary-700' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-100 fixed left-0 top-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md border border-slate-100"
      >
        <Menu className="w-5 h-5 text-navy-900" />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-slide-down">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
