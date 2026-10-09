import {
  Users, FileText, ShieldAlert, ShieldX, TrendingUp, AlertTriangle,
  Activity, ChevronRight,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import { RiskDoughnutChart, AccessActivityChart } from '../components/ui/Charts';
import { mockAdminStats, mockAdminAlerts, riskDistributionData, accessActivityData } from '../data/mockData';

export default function AdminDashboard() {
  const severityStyles = {
    high: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-600', dot: 'bg-rose-500' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', dot: 'bg-amber-500' },
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="System-wide security monitoring and risk oversight" isAdmin>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Users} label="Total Users" value={mockAdminStats.totalUsers.toLocaleString()} color="primary" trend="+8%" trendUp />
          <StatCard icon={FileText} label="Documents Analyzed" value={mockAdminStats.documentsAnalyzed.toLocaleString()} color="accent" trend="+12%" trendUp />
          <StatCard icon={ShieldAlert} label="High Risk Documents" value={mockAdminStats.highRiskDocuments.toLocaleString()} color="rose" trend="+3%" trendUp={false} />
          <StatCard icon={ShieldX} label="Blocked Access Attempts" value={mockAdminStats.blockedAccessAttempts} color="amber" trend="+5" trendUp={false} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-navy-900">Risk Distribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">All documents by risk level</p>
              </div>
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <RiskDoughnutChart data={riskDistributionData} />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-navy-900">Access Activity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Weekly access events</p>
              </div>
              <Activity className="w-5 h-5 text-accent-500" />
            </div>
            <AccessActivityChart data={accessActivityData} />
          </div>
        </div>

        {/* Security Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-navy-900">Recent Security Alerts</h3>
            </div>
            <span className="badge badge-danger">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {mockAdminAlerts.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {mockAdminAlerts.map((alert) => {
              const s = severityStyles[alert.severity] || severityStyles.medium;
              return (
                <div
                  key={alert.id}
                  className={`flex items-center gap-4 p-4 rounded-xl ${s.bg} border ${s.border} hover:shadow-sm transition-all`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0 animate-pulse`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{alert.desc}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{alert.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Document Monitoring', desc: 'Inspect all documents', path: '/admin/documents' },
            { label: 'Risk Monitoring', desc: 'View risk analytics', path: '/admin/risk-monitoring' },
            { label: 'Audit Logs', desc: 'System audit trail', path: '/admin/audit-logs' },
          ].map((link, i) => (
            <a
              key={i}
              href={link.path}
              className="card p-5 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-navy-900 text-sm">{link.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
