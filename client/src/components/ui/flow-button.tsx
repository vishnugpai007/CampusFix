'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children?: React.ReactNode;
  variant?: 'dark' | 'light';
}

export function FlowButton({ 
  text = "Modern Button", 
  children, 
  className = "", 
  variant = "dark",
  ...props 
}: FlowButtonProps) {
  const content = children || text;
  const isLight = variant === 'light';

  const baseBorder = isLight ? 'border-[#333333]/40' : 'border-sky-500/40 bg-slate-900/90';
  const baseText = isLight ? 'text-[#111111]' : 'text-slate-100';
  const strokeColor = isLight ? 'stroke-[#111111]' : 'stroke-slate-100';
  const circleBg = isLight ? 'bg-[#111111]' : 'bg-sky-500';

  return (
    <button 
      className={`group relative flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] ${baseBorder} px-8 py-3 text-sm font-semibold ${baseText} cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95] ${className}`}
      {...props}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className={`absolute w-4 h-4 left-[-25%] ${strokeColor} fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]`} 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out flex items-center justify-center gap-1.5">
        {content}
      </span>

      {/* Circle */}
      <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${circleBg} rounded-[50%] opacity-0 group-hover:w-[300px] group-hover:h-[300px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]`}></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className={`absolute w-4 h-4 right-4 ${strokeColor} fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]`} 
      />
    </button>
  );
}

export default FlowButton;
