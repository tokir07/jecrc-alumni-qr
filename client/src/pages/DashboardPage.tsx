import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import { DashboardData } from '../types';
import { MetricCard } from '../components/MetricCard';
import { DiwaliLamp } from '../components/DiwaliLamp';
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarCheck,
  RefreshCw,
  QrCode,
  FileSpreadsheet,
  TrendingUp,
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

  // Periodic auto-refresh every 15 seconds for live event-day monitoring
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#D9AD56]/30">
        <div>
          <div className="flex items-center gap-2">
            <DiwaliLamp size={28} />
            <span className="text-xs font-bold text-[#D9AD56] uppercase tracking-widest">
              Live Operations Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101A32] font-serif mt-1">
            Diwali Get-Together 2026 Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time alumni attendance and entry gate analytics
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-white px-3 py-2 rounded-xl border border-gray-200 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-[#101A32] focus:ring-[#D9AD56]"
            />
            <span>Live Sync (15s)</span>
          </label>

          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-[#101A32] hover:border-[#D9AD56] shadow-sm transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Refresh statistics now"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#D9AD56]' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/admin/scanner"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#101A32] text-white hover:bg-[#1B2A50] text-xs font-bold shadow transition-all"
          >
            <QrCode className="w-4 h-4 text-[#D9AD56]" />
            <span>Open Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Registered Alumni"
          value={loading ? '...' : (data?.metrics.totalRegistered ?? 0)}
          subtext="Confirmed registrations"
          icon={Users}
          colorTheme="navy"
        />

        <MetricCard
          title="Total Checked-In Alumni"
          value={loading ? '...' : (data?.metrics.totalCheckedIn ?? 0)}
          subtext={`${data?.metrics.checkInPercentage ?? 0}% turnout rate`}
          icon={CheckCircle2}
          colorTheme="green"
        />

        <MetricCard
          title="Pending Entries"
          value={loading ? '...' : (data?.metrics.pendingEntries ?? 0)}
          subtext="Awaiting gate arrival"
          icon={Clock}
          colorTheme="orange"
        />

        <MetricCard
          title="Total Entries Today"
          value={loading ? '...' : (data?.metrics.totalEntriesToday ?? 0)}
          subtext="Gate scans recorded today"
          icon={CalendarCheck}
          colorTheme="gold"
        />
      </div>

      {/* Attendance Activity Over Time Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D9AD56]/30 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#493078]/10 text-[#493078]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101A32] font-serif">
                Attendance Timeline Overview
              </h2>
              <p className="text-xs text-gray-500">
                Number of alumni arrivals grouped by hour
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          {data?.hourlyActivity && data.hourlyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9AD56" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D9AD56" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101A32',
                    borderColor: '#D9AD56',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#E5C174' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Check-ins"
                  stroke="#D9AD56"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#entryGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
              <Clock className="w-8 h-8 text-gray-300 mb-2" />
              <span>No check-in entries recorded yet today. Check-ins will plot in real time.</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Check-ins Table */}
      <div className="bg-white rounded-3xl border border-[#D9AD56]/30 shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#101A32] font-serif">
              Recent Check-ins
            </h2>
            <p className="text-xs text-gray-500">
              Latest alumni entries verified at the gates
            </p>
          </div>

          <Link
            to="/admin/registrations"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#493078] hover:text-[#101A32] hover:underline"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>View All Registrations →</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FFF9EE] text-[#101A32] uppercase text-[11px] font-bold tracking-wider border-b border-[#D9AD56]/20">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Batch</th>
                <th className="px-6 py-3.5">Branch</th>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Gate / Verified By</th>
                <th className="px-6 py-3.5">Check-in Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Loading recent check-ins...
                  </td>
                </tr>
              ) : data?.recentCheckIns && data.recentCheckIns.length > 0 ? (
                data.recentCheckIns.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#101A32]">
                      <div>{item.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {item.registrationId}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{item.batch}</td>
                    <td className="px-6 py-4 text-xs">{item.branch}</td>
                    <td className="px-6 py-4 font-semibold text-[#101A32]">
                      {item.company}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.designation}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-medium text-[#493078]">{item.gateName}</span>
                      <span className="text-gray-400 block text-[10px]">
                        by {item.checkedInBy}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-[#16845B]">
                      {item.checkInTime}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No recent check-ins yet. Alumni will appear here as they are scanned at the gate.
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
