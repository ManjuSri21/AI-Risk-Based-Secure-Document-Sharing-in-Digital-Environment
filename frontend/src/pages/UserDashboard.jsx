import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldAlert, Share2, Eye, Upload, ArrowRight, Activity, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import DocumentTable from '../components/ui/DocumentTable';
import SecurityPipeline from '../components/ui/SecurityPipeline';
import { SecurityDashboardCharts } from '../components/ui/Charts';
import { mockDocuments, mockStats, riskDistributionData } from '../data/mockData';
import { documentsApi, auditApi } from '../services/api';

const buildAccessActivityData = (logs) => {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    return day;
  });
  const activity = {
    labels: days.map((day) => day.toLocaleDateString('en-US', { weekday: 'short' })),
    sharesCreated: Array(7).fill(0),
    otpVerified: Array(7).fill(0),
    blockedRequests: Array(7).fill(0),
  };
  const dayIndexes = new Map(days.map((day, index) => [day.toDateString(), index]));

  logs.forEach((log) => {
    const timestamp = new Date(log.timestamp);
    const index = dayIndexes.get(new Date(
      timestamp.getFullYear(),
      timestamp.getMonth(),
      timestamp.getDate()
    ).toDateString());
    if (index === undefined) return;

    if (log.action === 'Shared') activity.sharesCreated[index] += 1;
    if (log.action === 'OTP Verified') activity.otpVerified[index] += 1;
    if (log.result === 'Blocked' || log.action === 'Link Expired') {
      activity.blockedRequests[index] += 1;
    }
  });

  return activity;
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(mockDocuments);
  const [stats, setStats] = useState(mockStats);
  const [riskData, setRiskData] = useState(riskDistributionData);
  const [activityData, setActivityData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDocs = async () => {
      try {
        const [docsRes, logsRes] = await Promise.allSettled([
          documentsApi.getAll(),
          auditApi.getMyLogs(),
        ]);

        if (isMounted) {
          const docs = (docsRes.status === 'fulfilled' && docsRes.value?.documents) || [];
          const logs = (logsRes.status === 'fulfilled' && logsRes.value?.logs) || [];
          setActivityData(buildAccessActivityData(logs));

          const formattedDocs = docs.map((d) => ({
            id: d._id,
            _id: d._id,
            name: d.name,
            size: d.sizeFormatted || `${d.fileSize || 0} bytes`,
            type: d.fileType || 'PDF',
            riskLevel: d.riskLevel,
            riskScore: d.riskScore,
            status: d.status,
            owner: d.ownerName || 'You',
            uploadDate: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            lastAccessed: 'Just now',
          }));
          setDocuments(formattedDocs);

          const highCount = formattedDocs.filter((d) => d.riskLevel === 'HIGH').length;
          const medCount = formattedDocs.filter((d) => d.riskLevel === 'MEDIUM').length;
          const lowCount = formattedDocs.filter((d) => d.riskLevel === 'LOW').length;
          const sharedCount = formattedDocs.filter((d) => d.status === 'Shared').length;

          setStats({
            totalDocuments: formattedDocs.length,
            highRiskDocuments: highCount,
            sharedDocuments: sharedCount,
            recentAccessEvents: logs.length,
          });

          setRiskData({
            high: highCount,
            medium: medCount,
            low: lowCount,
          });
        }
      } catch {
        // Keeps clean zero defaults
      }
    };
    fetchDocs();
    return () => { isMounted = false; };
  }, []);

  const recentDocs = documents.slice(0, 4);

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your secure document activity">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          icon={FileText}
          label="Total Documents"
          value={stats.totalDocuments}
          color="primary"
          trend={stats.totalDocuments > 0 ? `${stats.totalDocuments} files` : '0 files'}
          trendUp={stats.totalDocuments > 0}
        />
        <StatCard
          icon={ShieldAlert}
          label="High Risk Documents"
          value={stats.highRiskDocuments}
          color="rose"
          trend={stats.highRiskDocuments > 0 ? `${stats.highRiskDocuments} flagged` : '0 flagged'}
          trendUp={false}
        />
        <StatCard
          icon={Share2}
          label="Shared Documents"
          value={stats.sharedDocuments}
          color="accent"
          trend={stats.sharedDocuments > 0 ? `${stats.sharedDocuments} active` : '0 active'}
          trendUp={stats.sharedDocuments > 0}
        />
        <StatCard
          icon={Eye}
          label="Recent Access Events"
          value={stats.recentAccessEvents}
          color="amber"
          trend={stats.recentAccessEvents > 0 ? `${stats.recentAccessEvents} events` : '0 events'}
          trendUp={stats.recentAccessEvents > 0}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-6">
        <SecurityDashboardCharts
          riskData={riskData}
          total={stats.totalDocuments}
          activityData={activityData}
        />
      </div>

      {/* Security Pipeline */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-navy-900 mb-1">Security Pipeline</h3>
            <p className="text-xs text-slate-400">End-to-end document security workflow</p>
          </div>
          <Activity className="w-5 h-5 text-primary-600" />
        </div>
        <SecurityPipeline />
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
          onView={(doc) => navigate('/repository', { state: { viewDocument: doc } })}
          onAnalyze={(doc) => navigate('/risk-analysis', { state: { doc } })}
          onShare={(doc) => navigate('/share', { state: { doc } })}
        />
      </div>
    </DashboardLayout>
  );
}
