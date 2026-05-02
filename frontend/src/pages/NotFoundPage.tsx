import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-7xl"
        >
          📉
        </motion.div>
        <h1 className="text-6xl font-black text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          ← Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
