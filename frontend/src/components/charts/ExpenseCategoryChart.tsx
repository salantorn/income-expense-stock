import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useAuthStore } from '../../store/auth.store';
import { CategorySummary } from '../../types';

interface ExpenseCategoryChartProps {
  categories: CategorySummary[];
}

export function ExpenseCategoryChart({ categories }: ExpenseCategoryChartProps) {
  const { theme, currency } = useAuthStore();
  const isDark = theme === 'DARK';

  const textColor = isDark ? '#f9fafb' : '#111827';
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE').sort((a, b) => b.total - a.total);
  
  const pieColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1'];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#1f2937' : '#fff',
      textStyle: { color: textColor },
      formatter: (params: any) => {
        return `${params.name}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(params.value)} (${params.percent}%)`;
      }
    },
    legend: {
      show: false, // Hide legend to save space
    },
    series: [
      {
        name: 'Expenses',
        type: 'pie',
        radius: ['50%', '80%'], // Donut chart
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark ? '#18181b' : '#ffffff', // match card background
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: textColor,
            width: 120,
            overflow: 'truncate'
          }
        },
        labelLine: { show: false },
        data: expenseCategories.map((c, i) => ({
          name: c.category,
          value: c.total,
          itemStyle: { color: pieColors[i % pieColors.length] }
        })),
      }
    ]
  };

  if (expenseCategories.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No expenses recorded</div>;
  }

  return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
}
