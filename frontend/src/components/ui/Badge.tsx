import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'income' | 'expense' | 'positive' | 'negative' | 'neutral' | 'info';
  className?: string;
}

const variants = {
  income: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  expense: 'bg-red-500/15 text-red-400 border border-red-500/20',
  positive: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  negative: 'bg-red-500/15 text-red-400 border border-red-500/20',
  neutral: 'bg-secondary text-secondary-foreground border border-border',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
