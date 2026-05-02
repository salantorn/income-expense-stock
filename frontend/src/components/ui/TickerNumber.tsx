import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TickerNumberProps {
  value: number;
  formatFn?: (value: number) => string;
  className?: string;
  baseColor?: 'green' | 'red' | 'neutral';
}

export function TickerNumber({ 
  value, 
  formatFn, 
  className = '',
  baseColor = 'neutral'
}: TickerNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value !== prevValue) {
      const isIncreasing = value > prevValue;
      
      // Determine flash color based on base color and direction
      if (baseColor === 'green' && !isIncreasing) {
        setFlashColor('red');
      } else if (baseColor === 'red' && isIncreasing) {
        setFlashColor('green');
      } else if (baseColor === 'neutral') {
        setFlashColor(isIncreasing ? 'green' : 'red');
      }
      
      setDisplayValue(value);
      setPrevValue(value);

      // Clear flash after 300ms (half second)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFlashColor(null), 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, prevValue, baseColor]);

  const formatted = formatFn ? formatFn(displayValue) : displayValue.toFixed(2);
  const digits = formatted.split('');

  // Determine color classes
  const getColorClass = () => {
    if (flashColor === 'green') return 'text-emerald-400';
    if (flashColor === 'red') return 'text-red-400';
    if (baseColor === 'green') return 'text-emerald-500';
    if (baseColor === 'red') return 'text-red-500';
    return 'text-foreground';
  };

  return (
    <span className={`inline-flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayValue}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`inline-flex items-center transition-colors duration-300 ${getColorClass()}`}
        >
          {digits.map((digit, i) => (
            <motion.span
              key={`${i}-${digit}`}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.02, duration: 0.15 }}
              className="inline-block"
            >
              {digit}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface TickerCurrencyProps {
  value: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
  baseColor?: 'green' | 'red' | 'neutral';
}

export function TickerCurrency({ 
  value, 
  currency = 'USD', 
  className = '',
  showSign = false,
  baseColor = 'neutral'
}: TickerCurrencyProps) {
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

  return <TickerNumber value={value} formatFn={formatCurrency} className={className} baseColor={baseColor} />;
}

interface TickerPercentProps {
  value: number;
  className?: string;
  showSign?: boolean;
  baseColor?: 'green' | 'red' | 'neutral';
  showIcon?: boolean;
}

export function TickerPercent({ 
  value, 
  className = '', 
  showSign = true,
  baseColor = 'neutral',
  showIcon = false
}: TickerPercentProps) {
  const formatPercent = (val: number) => {
    const formatted = `${Math.abs(val).toFixed(2)}%`;
    if (showSign && val !== 0) {
      return val > 0 ? `+${formatted}` : `-${formatted}`;
    }
    return formatted;
  };

  const icon = showIcon && value !== 0 ? (value > 0 ? '▲ ' : '▼ ') : '';

  return (
    <span className="inline-flex items-center gap-0.5">
      {showIcon && value !== 0 && (
        <span className={value > 0 ? 'text-emerald-500' : 'text-red-500'} aria-hidden="true">
          {value > 0 ? '▲' : '▼'}
        </span>
      )}
      <TickerNumber value={value} formatFn={formatPercent} className={className} baseColor={baseColor} />
    </span>
  );
}
