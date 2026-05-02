import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useMonthlySummary, useCategoryBreakdown } from '../hooks/useTransactions';
import { usePortfolioValue } from '../hooks/usePortfolio';
import { useAuthStore } from '../store/auth.store';
import { getMonthName } from '../lib/utils';

export function AnalyticsPage() {
  const { theme } = useAuthStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: monthly = [] } = useMonthlySummary(year);
  const { data: categories = [] } = useCategoryBreakdown();
  const { data: portfolio } = usePortfolioValue();

  const isDark = theme === 'DARK';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const labelColor = isDark ? '#f9fafb' : '#111827';
  const gridColor = isDark ? '#1f2937' : '#f3f4f6';

  // Monthly bar chart
  const monthlyChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: isDark ? '#1f2937' : '#fff', textStyle: { color: labelColor } },
    legend: { data: ['Income', 'Expense'], textStyle: { color: textColor } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: monthly.map((m: any) => getMonthName(m.month)),
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor, formatter: (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: 'Income',
        type: 'bar',
        data: monthly.map((m: any) => Number(m.income)),
        barMaxWidth: 32,
        itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Expense',
        type: 'bar',
        data: monthly.map((m: any) => Number(m.expense)),
        barMaxWidth: 32,
        itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  // Category pie chart
  const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');
  const pieColors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];
  const categoryChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: isDark ? '#1f2937' : '#fff', textStyle: { color: labelColor } },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: textColor } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: isDark ? '#111827' : '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: labelColor } },
      data: expenseCategories.map((c: any, i: number) => ({
        name: c.category,
        value: Number(c.total),
        itemStyle: { color: pieColors[i % pieColors.length] },
      })),
    }],
  };

  // Net chart (line)
  const netChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: isDark ? '#1f2937' : '#fff', textStyle: { color: labelColor } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: monthly.map((m: any) => getMonthName(m.month)),
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [{
      name: 'Net',
      type: 'line',
      data: monthly.map((m: any) => Number(m.net)),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: '#6366f1' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.3)' }, { offset: 1, color: 'rgba(99,102,241,0.02)' }],
        },
      },
      itemStyle: { color: '#6366f1' },
    }],
  };

  // Portfolio positions bar
  const positionChartOption = portfolio?.positions?.length ? {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: isDark ? '#1f2937' : '#fff', textStyle: { color: labelColor } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: portfolio.positions.map((p: any) => p.symbol), axisLabel: { color: textColor } },
    yAxis: { type: 'value', axisLabel: { color: textColor }, splitLine: { lineStyle: { color: gridColor } } },
    series: [{
      name: 'Value',
      type: 'bar',
      data: portfolio.positions.map((p: any) => ({
        value: Number(p.currentValue ?? 0),
        itemStyle: { color: (p.pnl ?? 0) >= 0 ? '#10b981' : '#ef4444', borderRadius: [4, 4, 0, 0] },
      })),
    }],
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Visual insights into your finances</p>
        </div>
        <select
          className="px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {[2022, 2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Monthly Income vs Expense</h2>
          {monthly.some((m: any) => m.income > 0 || m.expense > 0) ? (
            <ReactECharts option={monthlyChartOption} style={{ height: 280 }} />
          ) : <p className="text-muted-foreground text-sm text-center py-16">No data for {year}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Expense by Category</h2>
          {expenseCategories.length > 0 ? (
            <ReactECharts option={categoryChartOption} style={{ height: 280 }} />
          ) : <p className="text-muted-foreground text-sm text-center py-16">No expense categories yet</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Monthly Net Cash Flow</h2>
          {monthly.some((m: any) => m.net !== 0) ? (
            <ReactECharts option={netChartOption} style={{ height: 280 }} />
          ) : <p className="text-muted-foreground text-sm text-center py-16">No data for {year}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Portfolio Holdings Value</h2>
          {positionChartOption ? (
            <ReactECharts option={positionChartOption} style={{ height: 280 }} />
          ) : <p className="text-muted-foreground text-sm text-center py-16">No portfolio positions yet</p>}
        </motion.div>
      </div>
    </div>
  );
}
