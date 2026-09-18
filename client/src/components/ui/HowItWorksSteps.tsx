import React from 'react';
import { Camera, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface StepItem {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const STEPS: StepItem[] = [
  {
    number: '01',
    icon: Camera,
    title: 'Submit',
    description: 'Add a photo, pin your location and describe the problem in seconds.'
  },
  {
    number: '02',
    icon: ThumbsUp,
    title: 'Upvote',
    description: 'Students push urgent issues to the top so staff see them first.'
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Resolve',
    description: 'Staff review the queue, the host responds and updates the status.'
  }
];

export const HowItWorksSteps: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 border-t border-slate-200 dark:border-slate-800">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          A seamless 3-step workflow connecting students, facility staff, and hostel management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm"
            >
              {/* Step Badge */}
              <div className="absolute -top-4 px-3 py-1 rounded-full bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 text-xs font-bold text-blue-600 dark:text-sky-400 tracking-wider">
                STEP {step.number}
              </div>

              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-700/80 border border-blue-100 dark:border-slate-600 text-blue-600 dark:text-sky-400 flex items-center justify-center mt-2 mb-5">
                <Icon className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorksSteps;
