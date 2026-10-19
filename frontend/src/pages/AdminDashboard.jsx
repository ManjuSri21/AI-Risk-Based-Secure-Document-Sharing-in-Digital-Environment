import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, ShieldAlert, ShieldX, AlertTriangle,
  ChevronRight, Clock, Share2, Calendar, ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import RiskBadge from '../components/ui/RiskBadge';
import { SecurityDashboardCharts } from '../components/ui/Charts';
import { adminApi } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    documentsAnalyzed: 0,
    highRiskDocuments: 0,
    blockedAccessAttempts: 0,
  });
  const [riskData, setRiskData] = useState({ low: 0, medium: 0, high: 0 });
  const [activityData, setActivityData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [statsRes, telemetryRes, docsRes] = await Promise.allSettled([
          adminApi.getStats(),
          adminApi.getRiskTelemetry(),
          adminApi.getDocuments(),
        ]);

        if (isMounted) {
          if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
            setStats(statsRes.value.stats);
          }
          if (statsRes.status === 'fulfilled' && statsRes.value?.alerts) {
            setAlerts(statsRes.value.alerts);
          }
          if (telemetryRes.status === 'fulfilled' && telemetryRes.value?.telemetry) {
            if (telemetryRes.value.telemetry.distribution) {
              setRiskData(telemetryRes.value.telemetry.distribution);
            }
            if (telemetryRes.value.telemetry.chartData) {
              setActivityData(telemetryRes.value.telemetry.chartData);
            }
          }
          if (docsRes.status === 'fulfilled' && docsRes.value?.documents) {
            setDocuments(docsRes.value.documents);
          }
        }
      } catch {
        // Retains zero clean state
      } finally {
        if (isMounted) setLoadingDocs(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const severityStyles = {
    high: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-600', dot: 'bg-rose-500' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', dot: 'bg-amber-500' },
  };

  const filteredDocs = documents.filter((d) => {
    const matchRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;
    return matchRisk;
  });

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="System-wide security monitoring and risk oversight" isAdmin>
      <div className="space-y-6">
        {/* Stat Cards with Real Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            color="primary"
            trend={stats.totalUsers > 0 ? `${stats.totalUsers} registered` : '0 users'}
            trendUp={stats.totalUsers > 0}
          />
          <StatCard
            icon={FileText}
            label="Documents Analyzed"
            value={stats.documentsAnalyzed.toLocaleString()}
            color="accent"
            trend={stats.documentsAnalyzed > 0 ? `${stats.documentsAnalyzed} total` : '0 total'}
            trendUp={stats.documentsAnalyzed > 0}
          />
          <StatCard
            icon={ShieldAlert}
            label="High Risk Documents"
            value={stats.highRiskDocuments.toLocaleString()}
            color="rose"
            trend={stats.highRiskDocuments > 0 ? `${stats.highRiskDocuments} flagged` : '0 flagged'}
            trendUp={false}
          />
          <StatCard
            icon={ShieldX}
            label="Blocked Access Attempts"
            value={stats.blockedAccessAttempts.toString()}
            color="amber"
            trend={stats.blockedAccessAttempts > 0 ? `${stats.blockedAccessAttempts} blocked` : '0 blocked'}
            trendUp={false}
          />
        </div>

        {/* Live Metadata Overview Section */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-700" />
                <h3 className="font-semibold text-navy-900 text-lg">Monitored Documents Metadata</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Zero-knowledge privacy enabled: metadata surveillance across all users with shielded contents
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input-field text-xs py-1.5 px-3 w-auto cursor-pointer"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>

              <Link
                to="/admin/documents"
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1 pl-2"
              >
                Open Full View <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Document Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Owner</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Upload Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">AI Risk Level</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Sharing Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Expiry Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.slice(0, 8).map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-primary-700 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-navy-900">{doc.name}</p>
                          <p className="text-[11px] text-slate-400">{doc.fileType || 'PDF'} · {doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-navy-700 font-medium">{doc.owner}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {doc.uploadDate}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <RiskBadge level={doc.riskLevel} />
                        <span className="text-[11px] text-slate-400 font-mono">({doc.riskScore})</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-slate-400" />
                        {doc.sharingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {doc.expiryTime}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocs.length === 0 && !loadingDocs && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No documents currently in database. Uploaded files will populate here in real time.
            </div>
          )}

          {loadingDocs && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading real metadata...
            </div>
          )}
        </div>

        {/* Real Charts Section */}
        <SecurityDashboardCharts
          riskData={riskData}
          total={stats.documentsAnalyzed}
          activityData={activityData}
        />

        {/* Security Alerts Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-navy-900">Recent Security Alerts</h3>
            </div>
            <span className={`badge ${alerts.length > 0 ? 'badge-danger' : 'badge-success'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${alerts.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              {alerts.length} Active
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>All security policies normal. No unauthorized access attempts recorded.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
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
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Document Monitoring', desc: 'Inspect all documents & privacy controls', path: '/admin/documents' },
            { label: 'Risk Monitoring', desc: 'View real-time risk analytics & telemetry', path: '/admin/risk-monitoring' },
            { label: 'Audit Logs', desc: 'System-wide forensic audit trail', path: '/admin/audit-logs' },
          ].map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="card p-5 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-navy-900 text-sm">{link.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
