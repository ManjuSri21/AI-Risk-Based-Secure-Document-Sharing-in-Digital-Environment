import { useNavigate } from 'react-router-dom';
import { FileText, ShieldAlert, Share2, Eye, Upload, ArrowRight, Activity, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import DocumentTable from '../components/ui/DocumentTable';
import SecurityPipeline from '../components/ui/SecurityPipeline';
import { RiskDoughnutChart } from '../components/ui/Charts';
import { mockDocuments, mockStats, riskDistributionData } from '../data/mockData';

export default function UserDashboard() {
  const navigate = useNavigate();
  const recentDocs = mockDocuments.slice(0, 4);

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your secure document activity">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={FileText} label="Total Documents" value={mockStats.totalDocuments} color="primary" trend="+12%" trendUp />
        <StatCard icon={ShieldAlert} label="High Risk Documents" value={mockStats.highRiskDocuments} color="rose" trend="+2" trendUp={false} />
        <StatCard icon={Share2} label="Shared Documents" value={mockStats.sharedDocuments} color="accent" trend="+5" trendUp />
        <StatCard icon={Eye} label="Recent Access Events" value={mockStats.recentAccessEvents} color="amber" trend="+8" trendUp />
      </div>

      {/* Charts + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="card p-6 lg:col-span-1">
          <h3 className="font-semibold text-navy-900 mb-1">Document Risk Overview</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution by risk level</p>
          <RiskDoughnutChart data={riskDistributionData} />
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-navy-900 mb-1">Security Pipeline</h3>
              <p className="text-xs text-slate-400">End-to-end document security workflow</p>
            </div>
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <SecurityPipeline compact />
        </div>
      </div>

      {/* Upload CTA */}
      <div className="card p-6 mb-6 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Upload className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900">Secure a New Document</h3>
              <p className="text-sm text-slate-500">Upload and let AI assess the risk before sharing.</p>
            </div>
          </div>
          <button onClick={() => navigate('/upload')} className="btn-primary">
            Upload Document
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900">Recent Documents</h3>
          <button onClick={() => navigate('/repository')} className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <DocumentTable
          documents={recentDocs}
          onView={(doc) => navigate('/repository')}
          onAnalyze={(doc) => navigate('/risk-analysis', { state: { doc } })}
          onShare={(doc) => navigate('/share', { state: { doc } })}
        />
      </div>
    </DashboardLayout>
  );
}
