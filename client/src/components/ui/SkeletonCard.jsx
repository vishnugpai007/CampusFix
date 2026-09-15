import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 animate-pulse flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-24 bg-slate-800 rounded-lg" />
          <div className="h-5 w-20 bg-slate-800 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-slate-800 rounded-md" />
        <div className="h-4 w-full bg-slate-800/60 rounded-md" />
        <div className="h-4 w-2/3 bg-slate-800/60 rounded-md" />
      </div>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-800 rounded-md" />
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 bg-slate-800 rounded-md" />
          <div className="h-8 w-16 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonFeed = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default SkeletonCard;
