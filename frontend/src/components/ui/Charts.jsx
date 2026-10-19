import { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PieChart, Activity } from 'lucide-react';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function RiskDistributionCard({ data, total }) {
  // 3 risk categories: Low, Medium, High
  const riskCounts = {
    low: Number(data?.low || 0),
    medium: Number(data?.medium || 0),
    high: Number(data?.high || 0),
  };

  const totalFiles = total !== undefined ? total : (riskCounts.low + riskCounts.medium + riskCounts.high);
  const isEmpty = totalFiles === 0;

  const chartData = {
    labels: ['Low Risk', 'Medium', 'High Risk'],
    datasets: [
      {
        data: isEmpty ? [1] : [riskCounts.low, riskCounts.medium, riskCounts.high],
        backgroundColor: isEmpty
          ? ['#f1f5f9']
          : [
              '#10b981', // Emerald - Low Risk
              '#f59e0b', // Amber - Medium
              '#f43f5e', // Rose/Red - High Risk
            ],
        borderWidth: isEmpty ? 1 : 3,
        borderColor: '#ffffff',
        hoverOffset: isEmpty ? 0 : 6,
        borderRadius: isEmpty ? 0 : 4,
        spacing: isEmpty ? 0 : 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !isEmpty,
        backgroundColor: '#0f172a',
        titleFont: { size: 12, family: 'Inter', weight: '600' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} file${context.raw === 1 ? '' : 's'}`,
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 800,
    },
  };

  return (
    <div className="flex flex-col">
      {/* Outer Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <PieChart className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-navy-900 tracking-tight">Risk Distribution</h3>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between flex-1">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h4 className="text-base font-bold text-navy-900 leading-snug">Document Risk Overview</h4>
            <p className="text-xs text-slate-400 mt-0.5">Real-time classification based on Decision Tree ML scoring</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 whitespace-nowrap shadow-2xs">
            {totalFiles} Total
          </span>
        </div>

        {/* Donut Chart with Centered Metric */}
        <div className="relative w-full h-[220px] flex items-center justify-center my-2">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-3xl sm:text-4xl font-extrabold text-navy-900 leading-none tracking-tight">
              {totalFiles}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              PROTECTED FILES
            </span>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Low Risk</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{riskCounts.low}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 border border-amber-100/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Medium</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{riskCounts.medium}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 border border-rose-100/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">High Risk</span>
            </div>
            <span className="text-xs font-bold text-slate-800">{riskCounts.high}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccessActivityCard({ activityData }) {
  const [timeRange, setTimeRange] = useState('7d');

  const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const labels = activityData?.labels || defaultLabels;
  const sharesData = activityData?.sharesCreated || [0, 0, 0, 0, 0, 0, 0];
  const otpData = activityData?.otpVerified || [0, 0, 0, 0, 0, 0, 0];
  const blockedData = activityData?.blockedRequests || [0, 0, 0, 0, 0, 0, 0];

  const totalActivity =
    sharesData.reduce((a, b) => a + b, 0) +
    otpData.reduce((a, b) => a + b, 0) +
    blockedData.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Encrypted Shares Created',
        data: sharesData,
        backgroundColor: '#6366f1', // Indigo/Blue
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: false,
        barPercentage: 0.8,
        categoryPercentage: 0.75,
      },
      {
        label: 'OTP Access Verifications',
        data: otpData,
        backgroundColor: '#10b981', // Emerald/Green
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: false,
        barPercentage: 0.8,
        categoryPercentage: 0.75,
      },
      {
        label: 'Blocked / Expired Requests',
        data: blockedData,
        backgroundColor: '#f43f5e', // Rose/Red
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: false,
        barPercentage: 0.8,
        categoryPercentage: 0.75,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, family: 'Inter', weight: '600' },
        bodyFont: { size: 11, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: totalActivity > 0 ? undefined : 5,
        ticks: {
          precision: 0,
          color: '#94a3b8',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: '#f1f5f9',
        },
        border: {
          display: false,
        },
      },
    },
    animation: {
      duration: 600,
    },
  };

  return (
    <div className="flex flex-col">
      {/* Outer Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-navy-900 tracking-tight">
          Access Activity
        </h3>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between flex-1">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <h4 className="text-base font-bold text-navy-900 leading-snug">Access & Sharing Activity</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekly security handshake volume & authentication attempts
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              7 Days
            </button>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Encrypted Shares Created ({sharesData.reduce((a, b) => a + b, 0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>OTP Access Verifications ({otpData.reduce((a, b) => a + b, 0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Blocked / Expired Requests ({blockedData.reduce((a, b) => a + b, 0)})</span>
          </div>
        </div>

        {/* Bar Chart Canvas */}
        <div className="w-full h-[220px] my-2">
          <Bar data={chartData} options={options} />
        </div>

        {/* Footer Rate */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${totalActivity > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>
              {totalActivity > 0
                ? `${totalActivity} Real Events Monitored`
                : 'No access activity recorded yet. Updates dynamically.'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Live Telemetry</span>
        </div>
      </div>
    </div>
  );
}

export function SecurityDashboardCharts({ riskData, total, activityData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <RiskDistributionCard data={riskData} total={total} />
      <AccessActivityCard activityData={activityData} />
    </div>
  );
}
