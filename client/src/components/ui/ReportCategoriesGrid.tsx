import React from 'react';
import {
  Wifi,
  Droplet,
  Zap,
  Armchair,
  UtensilsCrossed,
  ShieldAlert
} from 'lucide-react';

interface CategoryItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  isConfidential?: boolean;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'wifi',
    icon: Wifi,
    title: 'Wi-Fi & Network',
    description: 'Dead routers, weak signal, no internet in blocks.'
  },
  {
    id: 'plumbing',
    icon: Droplet,
    title: 'Plumbing',
    description: 'Leaks, blocked drains, no water supply.'
  },
  {
    id: 'electrical',
    icon: Zap,
    title: 'Electrical',
    description: 'Power cuts, faulty switches, broken fans and lights.'
  },
  {
    id: 'furniture',
    icon: Armchair,
    title: 'Furniture',
    description: 'Broken beds, chairs, desks and cupboards.'
  },
  {
    id: 'food',
    icon: UtensilsCrossed,
    title: 'Canteen & Food',
    description: 'Hygiene concerns, food quality and safety.'
  },
  {
    id: 'ragging_desk',
    icon: ShieldAlert,
    title: 'Ragging desk',
    description: 'Confidential channel reviewed only by the host.',
    isConfidential: true
  }
];

export const ReportCategoriesGrid: React.FC = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
          What You Can Report
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          CampusFix covers all major campus and hostel issue categories for fast assignment and quick resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className={`relative group p-6 rounded-2xl transition-all duration-200 ${
                cat.isConfidential
                  ? 'bg-rose-50/70 border border-rose-200 hover:border-rose-300 shadow-sm'
                  : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                    cat.isConfidential
                      ? 'bg-rose-100 text-rose-600 border border-rose-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                      {cat.title}
                    </h3>
                    {cat.isConfidential && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider border border-rose-200">
                        Strictly Private
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ReportCategoriesGrid;
