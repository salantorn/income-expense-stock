import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { usePositions, useAddPosition, useUpdatePosition, useDeletePosition, useRealtimePrices, useStockHistory } from '../hooks/usePortfolio';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { AlertDialog } from '../components/ui/AlertDialog';
import { TickerCurrency, TickerPercent } from '../components/ui/TickerNumber';
import { formatCurrency, formatPercent, formatDateInput } from '../lib/utils';
import { StockPosition, StockQuote } from '../types';
import { StockChart } from '../components/charts/StockChart';

const EMPTY_FORM = { symbol: '', quantity: '', purchasePrice: '', purchaseDate: formatDateInput(new Date()) };

function ExpandedStockRow({ pos, colSpan }: { pos: StockPosition; colSpan: number }) {
  const [timeframe, setTimeframe] = useState('1M');
  const { data: history, isLoading } = useStockHistory(pos.symbol, timeframe);
  const { mutate: updatePosition, isPending } = useUpdatePosition();

  const [tp, setTp] = useState(pos.takeProfitPrice ? String(pos.takeProfitPrice) : '');
  const [sl, setSl] = useState(pos.stopLossPrice ? String(pos.stopLossPrice) : '');

  const handleSaveTargets = () => {
    updatePosition({
      id: pos.id,
      data: {
        takeProfitPrice: tp ? parseFloat(tp) : null,
        stopLossPrice: sl ? parseFloat(sl) : null,
      },
    });
  };

  return (
    <tr>
      <td colSpan={colSpan} className="bg-accent/5 p-6 border-b border-border shadow-inner">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{pos.symbol} Chart</h3>
              <div className="flex gap-2 bg-secondary rounded-lg p-1">
                {['1D', '1W', '1M', '1Y'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${timeframe === tf ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Loading chart data...</div>
            ) : (
              <StockChart 
                data={history || []} 
                purchasePrice={Number(pos.purchasePrice)} 
                takeProfitPrice={pos.takeProfitPrice ? Number(pos.takeProfitPrice) : undefined} 
                stopLossPrice={pos.stopLossPrice ? Number(pos.stopLossPrice) : undefined} 
              />
            )}
          </div>

          <div className="w-full lg:w-[320px] flex flex-col gap-4 lg:border-l border-border lg:pl-6">
            <h3 className="font-semibold text-lg">Alert Targets</h3>
            <p className="text-sm text-muted-foreground">Receive an email when the price hits your targets.</p>

            <div className="space-y-4 pt-2">
              <Input label="Take Profit Price ($)" type="number" step="0.01" min="0" value={tp} onChange={(e) => setTp(e.target.value)} placeholder="0.00" />
              <Input label="Stop Loss Price ($)" type="number" step="0.01" min="0" value={sl} onChange={(e) => setSl(e.target.value)} placeholder="0.00" />
              <Button onClick={handleSaveTargets} loading={isPending} className="w-full mt-2">Save Targets</Button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export function PortfolioPage() {
  const { currency } = useAuthStore();
  const { data: positions = [], isLoading, refetch } = usePositions();
  const { mutate: addPosition, isPending: adding } = useAddPosition();
  const { mutate: updatePosition, isPending: updating } = useUpdatePosition();
  const { mutate: deletePosition } = useDeletePosition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<StockPosition | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handlePriceUpdate = useCallback((quotes: StockQuote[]) => {
    setLiveQuotes((prev) => {
      const next = new Map(prev);
      quotes.forEach((q) => next.set(q.symbol, q));
      return next;
    });
  }, []);

  useRealtimePrices(handlePriceUpdate);

  const openAdd = () => {
    setEditingPos(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (pos: StockPosition) => {
    setEditingPos(pos);
    setForm({
      symbol: pos.symbol,
      quantity: String(pos.quantity),
      purchasePrice: String(pos.purchasePrice),
      purchaseDate: formatDateInput(pos.purchaseDate),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    const data = {
      symbol: form.symbol.toUpperCase(),
      quantity: parseFloat(form.quantity),
      purchasePrice: parseFloat(form.purchasePrice),
      purchaseDate: form.purchaseDate,
    };

    if (editingPos) {
      updatePosition({ id: editingPos.id, data }, { 
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success('Position updated successfully');
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || error.message || 'Failed to update position';
          setIsModalOpen(false);
          setAlertDialog({
            isOpen: true,
            title: 'Update Failed',
            message: message
          });
        }
      });
    } else {
      addPosition(data, { 
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success(`${data.symbol} added to portfolio`);
        },
        onError: (error: any) => {
          console.error('Add position error:', error);
          
          const message = error.message || 'Failed to add position';
          const status = error.status;
          const code = error.code;
          
          // Check if it's a stock not found error
          const isNotFound = status === 404 || code === 'STOCK_NOT_FOUND';
          
          setIsModalOpen(false);
          setAlertDialog({
            isOpen: true,
            title: isNotFound ? 'Stock Not Found' : 'Error',
            message: message
          });
        }
      });
    }
  };

  // Merge live quotes with positions for real-time updates
  const livePositions = useMemo(() => {
    return positions.map(pos => {
      const live = liveQuotes.get(pos.symbol);
      if (!live) return pos;

      const currentPrice = live.price;
      const currentValue = pos.quantity * currentPrice;
      const costBasis = pos.quantity * pos.purchasePrice;
      const pnl = currentValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      return {
        ...pos,
        currentPrice,
        currentValue,
        costBasis,
        pnl,
        pnlPercent,
        change: live.change,
        changePercent: live.changePercent,
      };
    });
  }, [positions, liveQuotes]);

  const totalValue = livePositions.reduce((s, p) => s + (p.currentValue ?? 0), 0);
  const totalCost = livePositions.reduce((s, p) => s + (p.costBasis ?? 0), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Portfolio</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">Click on a stock to view details and set alerts</p>
            <span className="text-xs text-muted-foreground">•</span>
            <div className="flex items-center gap-1.5">
              <motion.span 
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className="text-xs text-emerald-400 font-medium">Real-time updates</span>
            </div>
          </div>
        </div>
        <Button onClick={openAdd} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>}>
          Add Position
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">Portfolio Value</p>
          <p className="text-xl font-bold mt-1">
            <TickerCurrency value={totalValue} currency={currency} baseColor="neutral" />
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-xl font-bold mt-1 text-muted-foreground">
            {formatCurrency(totalCost, currency)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">Total P&L</p>
          <div className="text-xl font-bold mt-1 flex items-center gap-2">
            <TickerCurrency 
              value={totalPnl} 
              currency={currency} 
              showSign 
              baseColor={totalPnl >= 0 ? 'green' : 'red'}
            />
            <span className="text-base">
              (<TickerPercent 
                value={totalPnlPct}
                baseColor={totalPnlPct >= 0 ? 'green' : 'red'}
              />)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading positions...</div>
        ) : livePositions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No positions yet</p>
            <Button onClick={openAdd}>Add your first stock position</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/20">
                <tr className="text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Symbol</th>
                  <th className="px-6 py-3 text-right font-medium">Qty</th>
                  <th className="px-6 py-3 text-right font-medium">Avg Cost</th>
                  <th className="px-6 py-3 text-right font-medium">Price</th>
                  <th className="px-6 py-3 text-right font-medium">Day</th>
                  <th className="px-6 py-3 text-right font-medium">Value</th>
                  <th className="px-6 py-3 text-right font-medium">P&L</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {livePositions.map((pos, i) => {
                  const dayChange = pos.changePercent ?? 0;
                  const isExpanded = expandedRow === pos.id;

                  return (
                    <React.Fragment key={pos.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button')) return;
                          setExpandedRow(isExpanded ? null : pos.id);
                        }}
                        className={`hover:bg-accent/10 transition-colors cursor-pointer group ${isExpanded ? 'bg-accent/10' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">{pos.symbol}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <motion.span 
                                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                animate={{ 
                                  scale: [1, 1.3, 1],
                                  opacity: [1, 0.6, 1]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              <span className="text-xs text-muted-foreground">Live</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">{pos.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(pos.purchasePrice, currency)}</td>
                        <td className="px-6 py-4 text-right font-medium">
                          <TickerCurrency value={pos.currentPrice ?? 0} currency={currency} baseColor="neutral" />
                        </td>
                        <td className={`px-6 py-4 text-right`}>
                          <TickerPercent 
                            value={dayChange} 
                            baseColor={dayChange >= 0 ? 'green' : 'red'}
                            showIcon={true}
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          <TickerCurrency value={pos.currentValue ?? 0} currency={currency} baseColor="neutral" />
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold`}>
                          <div>
                            <TickerCurrency 
                              value={pos.pnl ?? 0} 
                              currency={currency} 
                              showSign 
                              baseColor={(pos.pnl ?? 0) >= 0 ? 'green' : 'red'}
                            />
                          </div>
                          <div className="text-xs mt-1">
                            <TickerPercent 
                              value={pos.pnlPercent ?? 0}
                              baseColor={(pos.pnlPercent ?? 0) >= 0 ? 'green' : 'red'}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(pos)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button onClick={() => setDeleteConfirm(pos.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      {isExpanded && <ExpandedStockRow pos={pos} colSpan={8} />}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPos ? 'Edit Position' : 'Add Stock Position'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Stock Symbol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} placeholder="AAPL, TSLA, AMZN..." required disabled={!!editingPos} />
          <Input label="Quantity (shares)" type="number" step="0.0001" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" required />
          <Input label="Purchase Price (per share)" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="0.00" required />
          <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={adding || updating} className="flex-1">{editingPos ? 'Update' : 'Add Position'}</Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={alertDialog?.isOpen || false}
        onClose={() => setAlertDialog(null)}
        title={alertDialog?.title || ''}
        message={alertDialog?.message || ''}
        type="error"
      />

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        <p className="text-muted-foreground text-sm mb-6">Delete this stock position? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => { if (deleteConfirm) { deletePosition(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
