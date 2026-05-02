import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useResetPassword } from '../hooks/useAuth';

export function SettingsPage() {
  const { user, theme, setTheme, currency, setCurrency } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const saveCurrency = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-medium text-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground">Switch between dark and light mode</p>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(['DARK', 'LIGHT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 text-sm font-medium transition-all ${theme === t ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent/10'}`}
              >
                {t === 'DARK' ? '🌙 Dark' : '☀️ Light'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Currency</h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1.5">Display Currency</label>
            <select
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">🇺🇸 USD — US Dollar</option>
              <option value="EUR">🇪🇺 EUR — Euro</option>
              <option value="GBP">🇬🇧 GBP — British Pound</option>
              <option value="JPY">🇯🇵 JPY — Japanese Yen</option>
              <option value="THB">🇹🇭 THB — Thai Baht</option>
              <option value="SGD">🇸🇬 SGD — Singapore Dollar</option>
            </select>
          </div>
          <Button onClick={saveCurrency} variant={saved ? 'secondary' : 'primary'}>
            {saved ? '✓ Saved' : 'Save'}
          </Button>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">
          To change your password, use the <a href="/forgot-password" className="text-primary hover:underline">Forgot Password</a> flow with your registered email.
        </p>
      </motion.div>
    </div>
  );
}
