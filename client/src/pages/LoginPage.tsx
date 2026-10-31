import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JecrcLogo, JecrcCrest } from '../components/JecrcLogo';
import { Lock, User, AlertCircle, Loader2, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

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
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-9 rounded-2xl border border-[#E5E7EB] shadow-xs">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <JecrcCrest size={52} />
          </div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            JECRC UNIVERSITY • STAFF PORTAL
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight mt-1">
            Admin & Volunteer <span className="text-[#E31827]">Sign In</span>
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Diwali Get-Together 2026 entry management
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin or volunteer1"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Pre-configured Demo Accounts */}
        <div className="pt-4 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B] font-semibold mb-2 text-[11px] uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-[#E31827]" />
            <span>Pre-configured Credentials:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'Admin@JECRC2026!')}
              className="p-2.5 rounded-xl bg-[#FAFAFB] hover:bg-gray-100 border border-[#E5E7EB] text-left transition-colors cursor-pointer"
            >
              <p className="font-bold text-[#172033] text-[11px]">Administrator</p>
              <p className="text-[#64748B] font-mono text-[10px]">admin</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('volunteer1', 'Volunteer@JECRC2026!')}
              className="p-2.5 rounded-xl bg-[#FAFAFB] hover:bg-gray-100 border border-[#E5E7EB] text-left transition-colors cursor-pointer"
            >
              <p className="font-bold text-[#172033] text-[11px]">Gate Volunteer</p>
              <p className="text-[#64748B] font-mono text-[10px]">volunteer1</p>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/register"
            className="text-xs text-[#64748B] hover:text-[#E31827] transition-colors"
          >
            ← Public Alumni Registration Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
