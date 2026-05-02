import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../lib/api';
import { TransactionFilters } from '../types';

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const res = await transactionApi.getAll(filters);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const res = await transactionApi.getBalance();
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await transactionApi.getByCategory();
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useMonthlySummary(year?: number) {
  const currentYear = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ['monthly-summary', currentYear],
    queryFn: async () => {
      const res = await transactionApi.getMonthlySummary(currentYear);
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => transactionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transactionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
