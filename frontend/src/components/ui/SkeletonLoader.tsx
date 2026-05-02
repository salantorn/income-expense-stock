import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function SkeletonLoader({ className, width, height, variant = 'rectangular' }: SkeletonLoaderProps) {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:400%_100%]';
  
  let borderRadius = 'rounded-md';
  if (variant === 'circular') borderRadius = 'rounded-full';
  
  return (
    <div
      className={cn(baseStyles, borderRadius, className)}
      style={{ width, height: variant === 'text' ? height || '1rem' : height }}
    />
  );
}
