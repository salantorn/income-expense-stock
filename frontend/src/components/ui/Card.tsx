import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, gradient = false, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground p-6',
        'backdrop-blur-sm',
        gradient && 'bg-gradient-to-br from-card to-card/50',
        hover && 'cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-shadow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  color?: 'green' | 'red' | 'blue' | 'purple' | 'default';
}

const colorMap = {
  green: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
  red: 'from-red-500/20 to-rose-500/10 border-red-500/30',
  blue: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  purple: 'from-violet-500/20 to-indigo-500/10 border-violet-500/30',
  default: '',
};

const iconColorMap = {
  green: 'bg-emerald-500/20 text-emerald-400',
  red: 'bg-red-500/20 text-red-400',
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-violet-500/20 text-violet-400',
  default: 'bg-primary/20 text-primary',
};

export function StatCard({ title, value, subtitle, icon, trend, color = 'default' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-2xl border bg-gradient-to-br p-6',
        colorMap[color] || 'border-border bg-card'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconColorMap[color])}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={cn('mt-3 text-xs font-medium flex items-center gap-1', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          <span>{trend >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend).toFixed(2)}% from last month</span>
        </div>
      )}
    </motion.div>
  );
}
