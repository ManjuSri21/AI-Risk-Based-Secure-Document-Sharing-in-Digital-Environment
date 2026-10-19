import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    navy: { bg: 'bg-navy-50', text: 'text-navy-600' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-300 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          {Icon && <Icon className={`w-5 h-5 ${c.text}`} />}
        </div>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-navy-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
