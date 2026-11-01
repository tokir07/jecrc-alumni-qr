import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JecrcLogo, JecrcCrest, JecrcUniversityLogo, JecrcAlumniLogo } from '../components/JecrcLogo';
import { Lock, User, AlertCircle, Loader2, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-9 rounded-2xl border border-[#E5E7EB] shadow-xs">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <JecrcUniversityLogo height={36} />
            <div className="h-6 w-[1px] bg-gray-200" />
            <JecrcAlumniLogo size={38} />
          </div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            JECRC UNIVERSITY • STAFF PORTAL
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight mt-1">
            Authorized <span className="text-[#E31827]">Sign In</span>
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Entry management and gate operations portal
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
                placeholder="Enter staff username"
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
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

        {/* Security Warning Notice */}
        <div className="pt-4 border-t border-gray-100 flex items-start gap-2.5 text-[#64748B] text-[11px] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
          <span>
            <strong>Restricted Access:</strong> This portal is intended exclusively for authorized JECRC University faculty, alumni coordinators, and gate volunteers. All login events and gate verification actions are cryptographically signed and logged.
          </span>
        </div>

        <div className="text-center pt-1">
          <Link
            to="/register"
            className="text-xs text-[#64748B] hover:text-[#E31827] transition-colors"
          >
            ← Back to Alumni Registration Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
