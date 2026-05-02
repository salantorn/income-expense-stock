import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useAuthStore } from '../../store/auth.store';
import { getMonthName } from '../../lib/utils';
import { MonthlySummary } from '../../types';

interface CashFlowChartProps {
  monthly: MonthlySummary[];
}

export function CashFlowChart({ monthly }: CashFlowChartProps) {
  const { theme, currency } = useAuthStore();
  const isDark = theme === 'DARK';

  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#1f2937' : '#f3f4f6';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1f2937' : '#fff',
      textStyle: { color: isDark ? '#f9fafb' : '#111827' },
      formatter: (params: any) => {
        let result = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(param.value)}<br/>`;
        });
        return result;
      }
    },
    grid: { left: '2%', right: '2%', bottom: '0%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: monthly.map((m) => getMonthName(m.month)),
      axisLabel: { color: textColor, margin: 16 },
      axisLine: { lineStyle: { color: gridColor } },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor, formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v) },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: 'Net Cash Flow',
        type: 'line',
        data: monthly.map((m) => m.net),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#34d399' }, // emerald-400
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(52, 211, 153, 0.4)' },
              { offset: 1, color: 'rgba(52, 211, 153, 0.05)' }
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
}
