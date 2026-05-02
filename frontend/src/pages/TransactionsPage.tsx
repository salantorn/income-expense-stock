import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate, formatDateInput } from '../lib/utils';
import { Transaction, TransactionType, TransactionFilters } from '../types';

const CATEGORIES = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Housing', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Education', 'Other'],
};

const EMPTY_FORM = {
  amount: '',
  type: 'EXPENSE' as TransactionType,
  category: 'Food',
  description: '',
  date: formatDateInput(new Date()),
};

export function TransactionsPage() {
  const { currency } = useAuthStore();
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useTransactions(filters);
  const { mutate: create, isPending: creating } = useCreateTransaction();
  const { mutate: update, isPending: updating } = useUpdateTransaction();
  const { mutate: deleteTx } = useDeleteTransaction();

  const openCreate = () => {
    setEditingTx(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setForm({
      amount: String(tx.amount),
      type: tx.type,
      category: tx.category,
      description: tx.description ?? '',
      date: formatDateInput(tx.date),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, amount: parseFloat(form.amount) };
    if (editingTx) {
      update({ id: editingTx.id, data }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      create(data, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const categories = CATEGORIES[form.type];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">Track your income and expenses</p>
        </div>
        <Button onClick={openCreate} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>}>
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3">
        <select
          className="px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={filters.type ?? ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined, page: 1 })}
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <input
          type="date"
          className="px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={filters.startDate ?? ''}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
        />
        <input
          type="date"
          className="px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={filters.endDate ?? ''}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
        />
        <Button variant="ghost" size="sm" onClick={() => setFilters({ page: 1, limit: 20 })}>
          Clear
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No transactions found</p>
            <Button onClick={openCreate}>Add your first transaction</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/20">
                  <tr className="text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Category</th>
                    <th className="px-6 py-3 text-left font-medium">Description</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data?.data.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(tx.date)}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{tx.category}</td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-xs">{tx.description || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'}>{tx.type}</Badge>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteConfirm(tx.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={data.pagination.page <= 1} onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTx ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(['INCOME', 'EXPENSE'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t, category: CATEGORIES[t][0] })}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${form.type === t ? (t === 'INCOME' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'text-muted-foreground hover:bg-accent/10'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <Input label="Amount" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Category</label>
            <select
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
              <option value={form.category === 'Other' ? 'Other' : 'Other'}>Other</option>
            </select>
          </div>

          <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add a note..." />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={creating || updating} className="flex-1">{editingTx ? 'Update' : 'Add Transaction'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete this transaction? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => { if (deleteConfirm) { deleteTx(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
