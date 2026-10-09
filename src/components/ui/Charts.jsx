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

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function RiskDoughnutChart({ data }) {
  const chartData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [data.low, data.medium, data.high],
        backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          font: { size: 12, family: 'Inter' },
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
  };

  return (
    <div style={{ height: 260 }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export function AccessActivityChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Access Events',
        data: data.values,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 8,
        barThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8' },
      },
    },
  };

  return (
    <div style={{ height: 240 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
