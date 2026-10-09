import { useEffect, useState } from 'react';

export default function RiskScore({ score, size = 180, label = 'Risk Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const stroke = circumference - (animatedScore / 100) * circumference;

  const color = score >= 75 ? '#f43f5e' : score >= 40 ? '#f59e0b' : '#10b981';
  const riskLabel = score >= 75 ? 'HIGH RISK' : score >= 40 ? 'MEDIUM RISK' : 'LOW RISK';

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += score / steps;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setAnimatedScore(Math.round(current));
    }, stepDuration);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="12"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={stroke}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-navy-900">{animatedScore}</span>
          <span className="text-xs text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold" style={{ color }}>{riskLabel}</span>
      </div>
      {label && <p className="text-xs text-slate-400 mt-1">{label}</p>}
    </div>
  );
}
