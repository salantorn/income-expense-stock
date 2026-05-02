import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import * as api from '../../lib/api';

vi.mock('../../lib/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockResponse = {
        message: 'User registered',
        user: { id: '1', email: 'test@example.com' },
      };

      vi.mocked(api.register).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => expect(result.current.register.isSuccess).toBe(true));
      expect(api.register).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should handle registration error', async () => {
      vi.mocked(api.register).mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => expect(result.current.register.isError).toBe(true));
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const mockResponse = {
        message: 'Login successful',
        user: {
          id: '1',
          email: 'test@example.com',
          settings: { theme: 'DARK' as const, currency: 'USD' },
        },
        token: 'jwt-token',
      };

      vi.mocked(api.login).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => expect(result.current.login.isSuccess).toBe(true));
      expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      vi.mocked(api.logout).mockResolvedValue({ message: 'Logged out' });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.logout.mutate();

      await waitFor(() => expect(result.current.logout.isSuccess).toBe(true));
      expect(api.logout).toHaveBeenCalled();
    });
  });
});
