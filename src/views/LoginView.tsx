import React, { useState } from 'react';
import { User } from '../types.ts';
import { api } from '../api.ts';
import { Compass, LogIn, Lock, Mail, ArrowLeft, Check } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
  onBackToApp: () => void;
}

const DEMO_ACCOUNTS = [
  { name: 'Sarah Jenkins (Traveler)', email: 'sarah@roamplan.app', pass: 'pass123' },
  { name: 'Alex Rivera (Backpacker)', email: 'alex@roamplan.app', pass: 'pass123' },
  { name: 'Galon Samosir (Curator)', email: 'galonsamosir1976@gmail.com', pass: 'pass123' },
];

export function LoginView({ onLoginSuccess, onNavigateToRegister, onBackToApp }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const user = await api.login({ email, password });
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login gagal, periksa email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await api.login({ email: demoEmail, password: demoPass });
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login demo gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToApp}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Masuk ke RoamPlan
          </h2>
          <p className="text-xs text-stone-500">
            Akses rencana perjalanan, peta harian, dan kolaborasi teman
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block text-center">
            Atau Masuk Cepat Akun Demo:
          </span>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickDemo(acc.email, acc.pass)}
                className="w-full py-1.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-700 font-medium flex items-center justify-between transition-colors"
              >
                <span>{acc.name}</span>
                <span className="text-[11px] text-amber-700 font-semibold">Login 1-Klik →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-stone-500 pt-2">
          Belum memiliki akun?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-amber-700 font-bold hover:underline"
          >
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
}
