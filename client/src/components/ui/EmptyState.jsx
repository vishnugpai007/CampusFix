import React from 'react';
import { Inbox } from 'lucide-react';
import { FlowButton } from './flow-button';

const EmptyState = ({
  icon: CustomIcon = Inbox,
  title = 'No issues found',
  description = 'We couldn’t find any issues matching your active search or filter criteria.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/70 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-400">
        <CustomIcon className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <FlowButton
          onClick={onAction}
          text={actionLabel}
        />
      )}
    </div>
  );
};

export default EmptyState;
