import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAuthStore } from '../../store/auth.store';

interface StockChartProps {
  data: { timestamp: number; price: number }[];
  purchasePrice?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
}

export function StockChart({ data, purchasePrice, takeProfitPrice, stopLossPrice }: StockChartProps) {
  const { theme } = useAuthStore();

  const options = useMemo(() => {
    const isDark = theme === 'DARK';
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const splitLineColor = isDark ? '#374151' : '#e5e7eb';
    
    const lineColor = '#3b82f6';
    const areaColorStart = 'rgba(59, 130, 246, 0.4)';
    const areaColorEnd = 'rgba(59, 130, 246, 0.0)';

    const markLines: any[] = [];
    if (purchasePrice) {
      markLines.push({
        yAxis: purchasePrice,
        name: 'Purchase',
        lineStyle: { color: isDark ? '#9ca3af' : '#6b7280', type: 'dashed' },
        label: { formatter: 'Avg Cost', position: 'insideStartBottom' }
      });
    }
    if (takeProfitPrice) {
      markLines.push({
        yAxis: takeProfitPrice,
        name: 'Take Profit',
        lineStyle: { color: '#10b981', type: 'solid' },
        label: { formatter: 'Take Profit', position: 'insideStartTop', color: '#10b981' }
      });
    }
    if (stopLossPrice) {
      markLines.push({
        yAxis: stopLossPrice,
        name: 'Stop Loss',
        lineStyle: { color: '#ef4444', type: 'solid' },
        label: { formatter: 'Stop Loss', position: 'insideStartBottom', color: '#ef4444' }
      });
    }

    return {
      grid: { top: 20, right: 30, bottom: 20, left: 50 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      xAxis: {
        type: 'time',
        axisLabel: { color: textColor },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { color: textColor, formatter: '${value}' },
        splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
      },
      series: [
        {
          data: data.map(d => [d.timestamp, d.price]),
          type: 'line',
          showSymbol: false,
          smooth: true,
          itemStyle: { color: lineColor },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: areaColorStart },
                { offset: 1, color: areaColorEnd }
              ]
            }
          },
          markLine: markLines.length > 0 ? {
            symbol: ['none', 'none'],
            data: markLines
          } : undefined
        }
      ]
    };
  }, [data, theme, purchasePrice, takeProfitPrice, stopLossPrice]);

  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No chart data available for this timeframe</div>;
  }

  return <ReactECharts option={options} style={{ height: '300px', width: '100%' }} />;
}
