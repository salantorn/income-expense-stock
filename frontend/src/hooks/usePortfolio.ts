import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { portfolioApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import { StockQuote } from '../types';

export function usePortfolioValue() {
  return useQuery({
    queryKey: ['portfolio-value'],
    queryFn: async () => {
      const res = await portfolioApi.getValue();
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await portfolioApi.getPositions();
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useAddPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => portfolioApi.addPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-value'] });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      portfolioApi.updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-value'] });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portfolioApi.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-value'] });
    },
  });
}

// Real-time price updates via Socket.io
export function useRealtimePrices(onPriceUpdate: (quotes: StockQuote[]) => void) {
  const { user } = useAuthStore();

  const handlePrices = useCallback(
    (data: { quotes: Array<{ symbol: string; data: StockQuote }>; timestamp: string }) => {
      const quotes = data.quotes.map((q) => q.data).filter(Boolean);
      onPriceUpdate(quotes);
    },
    [onPriceUpdate]
  );

  useEffect(() => {
    if (!user?.id) return;
    const socket = connectSocket(user.id);
    socket.on('portfolio:prices', handlePrices);

    return () => {
      socket.off('portfolio:prices', handlePrices);
      disconnectSocket();
    };
  }, [user?.id, handlePrices]);
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['stock-search', query],
    queryFn: async () => {
      if (!query || query.length < 1) return [];
      const res = await portfolioApi.search(query);
      return res.data.data;
    },
    enabled: query.length > 0,
    staleTime: 60_000,
  });
}

export function useStockHistory(symbol: string, timeframe: string) {
  return useQuery({
    queryKey: ['stock-history', symbol, timeframe],
    queryFn: async () => {
      const res = await portfolioApi.getHistory(symbol, timeframe);
      return res.data.data;
    },
    enabled: !!symbol,
    staleTime: 60_000,
  });
}

