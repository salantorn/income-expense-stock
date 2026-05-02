import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequestReset, useVerifyOtp, useResetPassword } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type Step = 'request' | 'verify' | 'reset';

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const { mutate: requestReset, isPending: requesting } = useRequestReset();
  const { mutate: verifyOtp, isPending: verifying } = useVerifyOtp();
  const { mutate: resetPassword, isPending: resetting } = useResetPassword();

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    requestReset(email, {
      onSuccess: () => setStep('verify'),
      onError: (err: any) => setError(err.message),
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verifyOtp({ email, otp }, {
      onSuccess: () => setStep('reset'),
      onError: (err: any) => setError(err.message),
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters');
    resetPassword({ email, otp, newPassword }, {
      onError: (err: any) => setError(err.message),
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {step === 'request' && "Enter your email to receive an OTP"}
            {step === 'verify' && `Check ${email} for your 6-digit code`}
            {step === 'reset' && "Set your new password"}
          </p>
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {(['request', 'verify', 'reset'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-2 h-2 rounded-full transition-all ${step === s ? 'bg-primary w-6' : s < step ? 'bg-primary/60' : 'bg-border'}`} />
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <AnimatePresence mode="wait">
            {step === 'request' && (
              <motion.form key="request" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRequest} className="space-y-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                <Button type="submit" loading={requesting} className="w-full">Send OTP</Button>
              </motion.form>
            )}
            {step === 'verify' && (
              <motion.form key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerify} className="space-y-4">
                <Input label="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" required maxLength={6} />
                <Button type="submit" loading={verifying} className="w-full">Verify OTP</Button>
                <button type="button" onClick={() => setStep('request')} className="w-full text-sm text-muted-foreground hover:text-foreground">← Back</button>
              </motion.form>
            )}
            {step === 'reset' && (
              <motion.form key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleReset} className="space-y-4">
                <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required />
                <Button type="submit" loading={resetting} className="w-full">Reset Password</Button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
