import { ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { RiskDoughnutChart, AccessActivityChart } from '../components/ui/Charts';
import StatCard from '../components/ui/StatCard';
import { riskDistributionData, accessActivityData, mockAdminStats } from '../data/mockData';

export default function AdminRiskMonitoring() {
  return (
    <DashboardLayout title="Risk Monitoring" subtitle="Global risk analytics and threat detection" isAdmin>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard icon={ShieldAlert} label="High Risk Documents" value={mockAdminStats.highRiskDocuments.toLocaleString()} color="rose" />
          <StatCard icon={ShieldCheck} label="Protected Documents" value="4,818" color="emerald" />
          <StatCard icon={TrendingUp} label="Risk Trend (7 days)" value="+3.2%" color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Risk Distribution</h3>
            <RiskDoughnutChart data={riskDistributionData} />
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Access Activity (Weekly)</h3>
            <AccessActivityChart data={accessActivityData} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Risk Level Breakdown</h3>
          <div className="space-y-4">
            {[
              { level: 'HIGH', count: 1024, color: 'rose', percent: 17.5 },
              { level: 'MEDIUM', count: 2100, color: 'amber', percent: 36.0 },
              { level: 'LOW', count: 2718, color: 'emerald', percent: 46.5 },
            ].map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge badge-${r.level.toLowerCase()}`}>{r.level} RISK</span>
                  <span className="text-sm font-semibold text-navy-900">{r.count.toLocaleString()} docs</span>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
