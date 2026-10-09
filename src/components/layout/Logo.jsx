import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', light = false }) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-base', iconInner: 'w-4 h-4' },
    md: { icon: 'w-9 h-9', text: 'text-lg', iconInner: 'w-5 h-5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', iconInner: 'w-7 h-7' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={`${s.icon} rounded-xl bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
        <ShieldCheck className={`${s.iconInner} text-white`} />
      </div>
      <div className="leading-tight">
        <span className={`${s.text} font-bold ${light ? 'text-white' : 'text-navy-900'} tracking-tight`}>
          SecureShare
        </span>
        <span className={`${s.text} font-bold gradient-text ml-1`}>AI</span>
      </div>
    </Link>
  );
}
