import React from 'react';
import { formatCategory } from '../../utils/formatters';
import { Wifi, Zap, Droplets, Utensils, Armchair, Sparkles, ShieldAlert, HelpCircle } from 'lucide-react';

const CATEGORY_ICONS = {
  wifi: Wifi,
  electricity: Zap,
  water: Droplets,
  mess: Utensils,
  furniture: Armchair,
  cleanliness: Sparkles,
  security: ShieldAlert,
  other: HelpCircle
};

const Badge = ({ category, className = '' }) => {
  const Icon = CATEGORY_ICONS[category] || HelpCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 ${className}`}
    >
      <Icon className="w-3.5 h-3.5 text-sky-400" />
      {formatCategory(category)}
    </span>
  );
};

export default Badge;
