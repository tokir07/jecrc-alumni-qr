import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DiwaliLamp } from '../components/DiwaliLamp';
import { Lock, User, AlertCircle, Loader2, ShieldCheck, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Default to scanner if volunteer, or dashboard if admin
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Authentication failed. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for review and evaluation convenience
  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#D9AD56]/40 shadow-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-[#101A32] shadow-md mb-3 border border-[#D9AD56]/40">
            <DiwaliLamp size={40} />
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#101A32]">
            Staff & Volunteer Portal
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            JECRC University • Diwali Get-Together 2026
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin or volunteer1"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#101A32] text-white font-serif font-bold text-sm shadow-md hover:bg-[#1B2A50] hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D9AD56]" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#D9AD56]" />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Panel */}
        <div className="pt-4 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium mb-2.5">
            <KeyRound className="w-3.5 h-3.5 text-[#D9AD56]" />
            <span>Pre-configured Test Accounts:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'Admin@JECRC2026!')}
              className="p-2 rounded-lg bg-gray-50 hover:bg-[#FFF9EE] border border-gray-200 hover:border-[#D9AD56] text-left transition-all cursor-pointer"
            >
              <p className="font-bold text-[#101A32]">👑 Administrator</p>
              <p className="text-gray-500 font-mono text-[10px]">admin</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('volunteer1', 'Volunteer@JECRC2026!')}
              className="p-2 rounded-lg bg-gray-50 hover:bg-[#FFF9EE] border border-gray-200 hover:border-[#D9AD56] text-left transition-all cursor-pointer"
            >
              <p className="font-bold text-[#493078]">🎫 Gate Volunteer</p>
              <p className="text-gray-500 font-mono text-[10px]">volunteer1</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
