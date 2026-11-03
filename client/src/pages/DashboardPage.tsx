import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import { DashboardData } from '../types';
import { MetricCard } from '../components/MetricCard';
import { JecrcCrest } from '../components/JecrcLogo';
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarCheck,
  RefreshCw,
  QrCode,
  FileSpreadsheet,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activePreset, setActivePreset] = useState<string>('all');

  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const result = await adminService.getDashboard();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Pause automatic polling if document is hidden to conserve Render Free resources
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchStats();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  const handleExportCsv = async () => {
    try {
      await adminService.downloadExportCsv();
    } catch {
      alert('Failed to download CSV export. Please try again.');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Hero Banner Card (Matches Reference Image) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="shrink-0 pt-0.5">
              <JecrcCrest size={44} className="sm:w-[52px] sm:h-[52px] border border-gray-100 shadow-xs" />
            </div>

            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                JECRC UNIVERSITY • ALUMNI ASSOCIATION
              </p>
              <h1 className="text-xl sm:text-3xl font-extrabold text-[#172033] tracking-tight leading-tight">
                Alumni Registration & <span className="text-[#E31827]">Entry Portal</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
                Diwali Get-Together 2026 operations: real-time verified admissions, gate scanning, attendance analytics, and cohort records.
              </p>
            </div>
          </div>

          {/* Action Buttons on Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0 w-full lg:w-auto">
            <Link
              to="/admin/scanner"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
            >
              <QrCode className="w-4 h-4 text-white shrink-0" />
              <span>Start Gate Scanner</span>
            </Link>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-gray-300 hover:bg-gray-50 text-[#172033] text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#E31827] shrink-0" />
              <span>Export CSV ({data?.metrics.totalRegistered ?? 0})</span>
            </button>

            <Link
              to="/admin/registrations"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-gray-300 hover:bg-gray-50 text-[#172033] text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#64748B] shrink-0" />
              <span>Directory Filters</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Four Metric Cards Row (Matches Reference Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <MetricCard
          title="TOTAL REGISTERED"
          value={loading ? '...' : (data?.metrics.totalRegistered ?? 0)}
          subtext="Verified graduate alumni directory"
          icon={Users}
        />

        <MetricCard
          title="TOTAL CHECKED-IN"
          value={loading ? '...' : (data?.metrics.totalCheckedIn ?? 0)}
          subtext={`${data?.metrics.checkInPercentage ?? 0}% verified turnout rate`}
          icon={CheckCircle2}
        />

        <MetricCard
          title="PENDING ENTRIES"
          value={loading ? '...' : (data?.metrics.pendingEntries ?? 0)}
          subtext="Awaiting university gate arrival"
          icon={Clock}
        />

        <MetricCard
          title="ENTRIES TODAY"
          value={loading ? '...' : (data?.metrics.totalEntriesToday ?? 0)}
          subtext="Gate scans recorded today"
          icon={CalendarCheck}
        />
      </div>

      {/* 3. One-Click Filtration Presets (Directly from Reference Screenshot) */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              One-Click Filtration Presets:
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto -mx-1 px-1">
            <button
              onClick={() => setActivePreset('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 min-h-[38px] ${
                activePreset === 'all'
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#E31827] font-semibold'
                  : 'bg-white border-[#E5E7EB] text-[#64748B] hover:bg-gray-50'
              }`}
            >
              <span>All Registrations</span>
            </button>

            <button
              onClick={() => setActivePreset('checked_in')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 min-h-[38px] ${
                activePreset === 'checked_in'
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#E31827] font-semibold'
                  : 'bg-white border-[#E5E7EB] text-[#64748B] hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Checked-In Only</span>
            </button>

            <button
              onClick={() => setActivePreset('pending')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer shrink-0 min-h-[38px] ${
                activePreset === 'pending'
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#E31827] font-semibold'
                  : 'bg-white border-[#E5E7EB] text-[#64748B] hover:bg-gray-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#D98A22]" />
              <span>Pending Arrival</span>
            </button>

            <Link
              to="/admin/registrations?degree=B.Tech"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-white border-[#E5E7EB] text-[#64748B] hover:bg-gray-50 text-xs font-medium shrink-0 min-h-[38px]"
            >
              <span>B.Tech Cohort</span>
            </Link>

            <Link
              to="/admin/registrations"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[#E31827] hover:underline shrink-0 min-h-[38px]"
            >
              <span>More filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Attendance Timeline Overview Chart */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#172033]">
              Attendance Timeline Overview
            </h2>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
              Hourly entry verification volume plotted against check-in time
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#64748B] w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="p-2 sm:p-1.5 rounded-lg border border-[#E5E7EB] text-gray-500 hover:text-[#172033] hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[38px]"
              title="Refresh now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#E31827]' : ''}`} />
              <span>Refresh</span>
            </button>

            <span className="text-[10px] sm:text-[11px] font-mono text-gray-400">
              Synced: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="h-56 sm:h-64 w-full">
          {data?.hourlyActivity && data.hourlyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E31827" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E31827" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E5E7EB" interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E5E7EB" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#172033',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: '#FEE2E2' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Verified Check-ins"
                  stroke="#E31827"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#entryGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#64748B] text-xs text-center p-4">
              <Clock className="w-8 h-8 text-gray-300 mb-2" />
              <span>No check-in entries recorded yet today. Check-ins will plot in real time.</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Check-ins Table / Mobile Cards */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#172033]">
              Recent Verified Check-ins
            </h2>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
              Live gate audit trail for Diwali Get-Together 2026
            </p>
          </div>

          <Link
            to="/admin/registrations"
            className="text-xs font-semibold text-[#E31827] hover:underline flex items-center gap-1 py-1"
          >
            <span>Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile View: Stacked Check-In Cards (< 768px) */}
        <div className="block md:hidden divide-y divide-[#E5E7EB]">
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-xs">Loading check-ins...</div>
          ) : data?.recentCheckIns && data.recentCheckIns.length > 0 ? (
            data.recentCheckIns.map((item) => (
              <div key={item.id} className="p-4 space-y-2 hover:bg-gray-50/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#172033] text-sm">{item.name}</h3>
                    <p className="text-[10px] font-mono text-[#64748B]">{item.registrationId}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#16845B] bg-[#EBF7F2] px-2 py-0.5 rounded border border-[#16845B]/20 shrink-0">
                    {item.checkInTime}
                  </span>
                </div>

                <div className="text-xs text-[#64748B] space-y-0.5">
                  <p>
                    <strong className="text-[#172033]">Class of {item.batch}</strong> • {item.degree ? `${item.degree} • ${item.course}` : item.branch}
                  </p>
                  <p>
                    {item.company} {item.designation ? `(${item.designation})` : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                  <span>Gate: <strong>{item.gateName}</strong></span>
                  <span>By: {item.checkedInBy}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              No alumni check-ins recorded yet today.
            </div>
          )}
        </div>

        {/* Desktop View: Wide Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFB] text-[#64748B] uppercase text-[11px] font-bold tracking-wider border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3">Alumnus Name & ID</th>
                <th className="px-5 py-3">Batch</th>
                <th className="px-5 py-3">Degree & Course</th>
                <th className="px-5 py-3">Company & Role</th>
                <th className="px-5 py-3">Gate</th>
                <th className="px-5 py-3">Verified By</th>
                <th className="px-5 py-3 text-right">Check-in Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#172033]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Loading check-ins...
                  </td>
                </tr>
              ) : data?.recentCheckIns && data.recentCheckIns.length > 0 ? (
                data.recentCheckIns.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#172033]">{item.name}</div>
                      <div className="text-[10px] font-mono text-[#64748B]">{item.registrationId}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-600">Class of {item.batch}</td>
                    <td className="px-5 py-3.5 text-gray-600 truncate max-w-[160px]">
                      {item.degree ? `${item.degree} • ${item.course}` : item.branch}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#172033]">{item.company}</div>
                      <div className="text-[11px] text-[#64748B]">{item.designation}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{item.gateName}</td>
                    <td className="px-5 py-3.5 text-gray-600">{item.checkedInBy}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-[#16845B]">
                      {item.checkInTime}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No alumni check-ins recorded yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
