import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { User } from '../types';

export function useMe() {
  const { setUser } = useAuthStore();
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authApi.getMe();
      const user: User = res.data.user;
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (res) => {
      setUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password),
    onSuccess: () => navigate('/login'),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useRequestReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestReset(email),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyOtp(email, otp),
  });
}

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
      authApi.resetPassword(email, otp, newPassword),
    onSuccess: () => navigate('/login'),
  });
}
