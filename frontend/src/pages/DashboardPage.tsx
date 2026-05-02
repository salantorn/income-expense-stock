import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBalance, useMonthlySummary, useCategoryBreakdown } from '../hooks/useTransactions';
import { usePortfolioValue } from '../hooks/usePortfolio';
import { useAuthStore } from '../store/auth.store';
import { StatCard } from '../components/ui/Card';
import { BentoGrid, BentoItem } from '../components/layout/BentoGrid';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { ExpenseCategoryChart } from '../components/charts/ExpenseCategoryChart';
import { formatCurrency, formatPercent } from '../lib/utils';

export function DashboardPage() {
  const { user, currency } = useAuthStore();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioValue();
  const { data: monthly } = useMonthlySummary();
  const { data: categories } = useCategoryBreakdown();

  const currentMonth = monthly?.find((m: any) => m.month === new Date().getMonth() + 1);
  const prevMonth = monthly?.find((m: any) => m.month === new Date().getMonth());
  const incomeTrend = prevMonth?.income
    ? ((currentMonth?.income ?? 0) - prevMonth.income) / prevMonth.income * 100
    : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">
          Good {getGreeting()}, {user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your finances</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={balanceLoading ? '...' : formatCurrency(balance?.balance ?? 0, currency)}
          subtitle="Net income - expenses"
          color={balance && balance.balance >= 0 ? 'blue' : 'red'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" /></svg>}
        />
        <StatCard
          title="Total Income"
          value={balanceLoading ? '...' : formatCurrency(balance?.income ?? 0, currency)}
          trend={incomeTrend}
          color="green"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" /><polyline points="17 6 23 6 23 12" strokeLinecap="round" /></svg>}
        />
        <StatCard
          title="Total Expenses"
          value={balanceLoading ? '...' : formatCurrency(balance?.expense ?? 0, currency)}
          color="red"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" strokeLinecap="round" /><polyline points="17 18 23 18 23 12" strokeLinecap="round" /></svg>}
        />
        <StatCard
          title="Portfolio Value"
          value={portfolioLoading ? '...' : formatCurrency(portfolio?.totalValue ?? 0, currency)}
          subtitle={portfolio ? `${formatPercent(portfolio.totalPnlPercent)} P&L` : undefined}
          color={portfolio && portfolio.totalPnl >= 0 ? 'purple' : 'red'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" /></svg>}
        />
      </div>

      {/* Monthly summary + Top expenses in Bento Grid */}
      <BentoGrid>
        {/* Monthly bars - Takes full width on mobile, 7fr on desktop */}
        <BentoItem id="monthly-chart" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-semibold text-foreground mb-4">Cash Flow ({new Date().getFullYear()})</h2>
          <CashFlowChart monthly={monthly ?? []} />
        </BentoItem>

        {/* Top expense categories - Takes full width on mobile, 3fr on desktop */}
        <BentoItem id="expense-categories" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-semibold text-foreground mb-4">Top Expense Categories</h2>
          <ExpenseCategoryChart categories={categories ?? []} />
        </BentoItem>
      </BentoGrid>

      {/* Portfolio Summary */}
      {portfolio && portfolio.positions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Portfolio Holdings</h2>
            <Link to="/portfolio" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="pb-2 text-left font-medium">Symbol</th>
                  <th className="pb-2 text-right font-medium">Price</th>
                  <th className="pb-2 text-right font-medium">Value</th>
                  <th className="pb-2 text-right font-medium">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {portfolio.positions.slice(0, 5).map((pos: any) => (
                  <tr key={pos.id}>
                    <td className="py-3 font-semibold text-foreground">{pos.symbol}</td>
                    <td className="py-3 text-right">{formatCurrency(pos.currentPrice ?? 0, currency)}</td>
                    <td className="py-3 text-right">{formatCurrency(pos.currentValue ?? 0, currency)}</td>
                    <td className={`py-3 text-right font-medium ${(pos.pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(pos.pnl ?? 0, currency)} ({formatPercent(pos.pnlPercent ?? 0)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
