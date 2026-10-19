import { riskColors } from '../../data/mockData';

export default function RiskBadge({ level, size = 'sm' }) {
  const colors = riskColors[level] || riskColors.LOW;
  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`badge ${colors.bg} ${colors.text} ${colors.border} border ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {level} RISK
    </span>
  );
}
