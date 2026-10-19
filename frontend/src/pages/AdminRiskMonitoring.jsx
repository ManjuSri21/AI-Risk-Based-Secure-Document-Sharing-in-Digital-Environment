import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { SecurityDashboardCharts } from '../components/ui/Charts';
import StatCard from '../components/ui/StatCard';
import { adminApi } from '../services/api';

export default function AdminRiskMonitoring() {
  const [riskData, setRiskData] = useState({ low: 0, medium: 0, high: 0 });
  const [activityData, setActivityData] = useState(null);
  const [breakdown, setBreakdown] = useState([
    { level: 'HIGH', count: 0, color: 'rose', percent: 0 },
    { level: 'MEDIUM', count: 0, color: 'amber', percent: 0 },
    { level: 'LOW', count: 0, color: 'emerald', percent: 0 },
  ]);
  const [highCount, setHighCount] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await adminApi.getRiskTelemetry();
        if (isMounted && res?.telemetry) {
          if (res.telemetry.distribution) {
            setRiskData(res.telemetry.distribution);
          }
          if (res.telemetry.breakdown) {
            setBreakdown(res.telemetry.breakdown);
          }
          if (res.telemetry.distribution?.high !== undefined) {
            setHighCount(res.telemetry.distribution.high);
          }
          if (res.telemetry.total !== undefined) {
            setTotalDocs(res.telemetry.total);
          }
          if (res.telemetry.chartData) {
            setActivityData(res.telemetry.chartData);
          }
        }
      } catch {
        // Keeps clean zero initial states
      }
    };
    fetchTelemetry();
    return () => { isMounted = false; };
  }, []);

  return (
    <DashboardLayout title="Risk Monitoring" subtitle="Global risk analytics and threat detection" isAdmin>
      <div className="space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            icon={ShieldAlert}
            label="High Risk Documents"
            value={highCount.toLocaleString()}
            color="rose"
            trend={highCount > 0 ? `${highCount} Flagged` : '0 Flagged'}
          />
          <StatCard
            icon={ShieldCheck}
            label="Protected Documents"
            value={totalDocs.toLocaleString()}
            color="emerald"
            trend={totalDocs > 0 ? `${totalDocs} Total` : '0 Total'}
          />
          <StatCard
            icon={TrendingUp}
            label="High Risk Ratio"
            value={totalDocs > 0 ? `${breakdown.find(b => b.level === 'HIGH')?.percent || 0}%` : '0.0%'}
            color="amber"
            trend={totalDocs > 0 ? 'Live Telemetry' : 'No Data Yet'}
          />
        </div>

        {/* Dynamic Charts */}
        <SecurityDashboardCharts riskData={riskData} total={totalDocs} activityData={activityData} />

        {/* Risk Level Breakdown Progress */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-navy-900">Risk Level Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time distribution across classification tiers</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {totalDocs} Total Document{totalDocs === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-4">
            {breakdown.map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge badge-${r.level.toLowerCase()}`}>{r.level} RISK</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">({r.percent}%)</span>
                    <span className="text-sm font-semibold text-navy-900">{r.count.toLocaleString()} docs</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${r.color}-500 rounded-full transition-all duration-700`}
                    style={{ width: `${r.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {totalDocs === 0 && (
            <p className="text-center text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
              No documents uploaded yet. As users upload and analyze documents, risk tiers will populate in real time.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
