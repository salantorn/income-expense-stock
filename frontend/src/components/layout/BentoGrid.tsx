import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BentoGridProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <motion.div
      layout
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[7fr_3fr] gap-6',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface BentoItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  id?: string;
}

export function BentoItem({ children, className, id, ...props }: BentoItemProps) {
  return (
    <motion.div
      layoutId={id ? `grid-item-${id}` : undefined}
      layout
      className={cn(
        'bg-card border border-border rounded-2xl p-6 relative overflow-hidden',
        className
      )}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {/* Optional glassmorphism shine effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-white/2 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
      {children}
    </motion.div>
  );
}
