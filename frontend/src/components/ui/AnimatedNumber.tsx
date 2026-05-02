import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  formatFn?: (value: number) => string;
  className?: string;
  duration?: number;
  baseColor?: 'green' | 'red' | 'neutral';
}

export function AnimatedNumber({ 
  value, 
  formatFn, 
  className = '', 
  duration = 0.8,
  baseColor = 'neutral'
}: AnimatedNumberProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);
  const springValue = useSpring(value, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(springValue, (latest) => 
    formatFn ? formatFn(latest) : latest.toFixed(2)
  );

  useEffect(() => {
    if (value !== prevValue) {
      const isIncreasing = value > prevValue;
      
      // Flash opposite color if base color is set
      if (baseColor === 'green' && !isIncreasing) {
        setFlashColor('red');
      } else if (baseColor === 'red' && isIncreasing) {
        setFlashColor('green');
      } else if (baseColor === 'neutral') {
        setFlashColor(isIncreasing ? 'green' : 'red');
      }
      
      springValue.set(value);
      setPrevValue(value);

      // Reset flash after animation
      const timer = setTimeout(() => setFlashColor(null), duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue, springValue, duration, baseColor]);

  // Determine final color
  const getColorClass = () => {
    if (flashColor === 'green') return 'text-emerald-400';
    if (flashColor === 'red') return 'text-red-400';
    if (baseColor === 'green') return 'text-emerald-400';
    if (baseColor === 'red') return 'text-red-400';
    return '';
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{
        scale: flashColor !== null ? [1, 1.05, 1] : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        className={`inline-block transition-colors duration-300 ${getColorClass()}`}
      >
        {display}
      </motion.span>
    </motion.span>
  );
}

interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
  baseColor?: 'green' | 'red' | 'neutral';
}

export function AnimatedCurrency({ 
  value, 
  currency = 'USD', 
  className = '',
  showSign = false,
  baseColor = 'neutral'
}: AnimatedCurrencyProps) {
  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
    
    if (showSign && val !== 0) {
      return val > 0 ? `+${formatted}` : `-${formatted}`;
    }
    return formatted;
  };

  return <AnimatedNumber value={value} formatFn={formatCurrency} className={className} baseColor={baseColor} />;
}

interface AnimatedPercentProps {
  value: number;
  className?: string;
  showSign?: boolean;
  baseColor?: 'green' | 'red' | 'neutral';
}

export function AnimatedPercent({ 
  value, 
  className = '', 
  showSign = true,
  baseColor = 'neutral'
}: AnimatedPercentProps) {
  const formatPercent = (val: number) => {
    const formatted = `${Math.abs(val).toFixed(2)}%`;
    if (showSign && val !== 0) {
      return val > 0 ? `+${formatted}` : `-${formatted}`;
    }
    return formatted;
  };

  return <AnimatedNumber value={value} formatFn={formatPercent} className={className} baseColor={baseColor} />;
}
