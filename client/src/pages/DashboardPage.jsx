import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { parseApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { formatStatus, formatTimeAgo } from '../utils/formatters';

import StatusPill from '../components/ui/StatusPill';
import Badge from '../components/ui/Badge';
import { SkeletonFeed } from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';

import {
  LayoutDashboard,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const DashboardPage = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationData, setPaginationData] = useState({ totalPages: 1, totalItems: 0, limit: 10 });
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch summary stats and recent issue list concurrently
      const params = { page, limit: 10, sort: 'newest' };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const [statsRes, issuesRes] = await Promise.all([
        api.get('/issues/stats/summary'),
        api.get('/issues', { params })
      ]);

      setStats(statsRes.data.data);
      const { issues: items, pagination } = issuesRes.data.data;
      setIssues(items || []);
      if (pagination) {
        setPaginationData({
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.total || items.length,
          limit: pagination.limit || 10
        });
      }
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const byStatus = stats?.byStatus || {};
  const openCount = byStatus.open || 0;
  const inProgressCount = byStatus.in_progress || 0;
  const resolvedCount = byStatus.resolved || 0;
  const rejectedCount = byStatus.rejected || 0;
  const totalCount = openCount + inProgressCount + resolvedCount + rejectedCount;

  // Percentage calculations for breakdown bar
  const openPct = totalCount ? Math.round((openCount / totalCount) * 100) : 0;
  const inProgressPct = totalCount ? Math.round((inProgressCount / totalCount) * 100) : 0;
  const resolvedPct = totalCount ? Math.round((resolvedCount / totalCount) * 100) : 0;
  const rejectedPct = totalCount ? Math.round((rejectedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-sky-400" />
            <span>Staff Management Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Overview of campus maintenance requests, resolution statistics, and operations
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Staff / Admin Mode</span>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Issues</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100">{totalCount}</p>
          <span className="text-[11px] text-slate-500">All time reported</span>
        </div>

        {/* Open */}
        <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 sm:p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-medium">Open</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-300">{openCount}</p>
          <span className="text-[11px] text-amber-400/70">{openPct}% of total</span>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/60 border border-sky-500/20 rounded-2xl p-4 sm:p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-medium">In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-sky-300">{inProgressCount}</p>
          <span className="text-[11px] text-sky-400/70">{inProgressPct}% of total</span>
        </div>

        {/* Resolved */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-300">{resolvedCount}</p>
          <span className="text-[11px] text-emerald-400/70">{resolvedPct}% of total</span>
        </div>

        {/* Rejected */}
        <div className="col-span-2 lg:col-span-1 bg-slate-900/60 border border-rose-500/20 rounded-2xl p-4 sm:p-5 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-medium">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-300">{rejectedCount}</p>
          <span className="text-[11px] text-rose-400/70">{rejectedPct}% of total</span>
        </div>
      </div>

      {/* Visual Status Breakdown Chart Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Status Distribution Breakdown</span>
          </h3>
          <span className="text-xs text-slate-400">{totalCount} total reports</span>
        </div>

        {/* Distribution Progress Stack */}
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${openPct}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Open: ${openCount} (${openPct}%)`}
          />
          <div
            style={{ width: `${inProgressPct}%` }}
            className="bg-sky-500 h-full transition-all duration-500"
            title={`In Progress: ${inProgressCount} (${inProgressPct}%)`}
          />
          <div
            style={{ width: `${resolvedPct}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Resolved: ${resolvedCount} (${resolvedPct}%)`}
          />
          <div
            style={{ width: `${rejectedPct}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Rejected: ${rejectedCount} (${rejectedPct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Open ({openCount})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>In Progress ({inProgressCount})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Resolved ({resolvedCount})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Rejected ({rejectedCount})</span>
          </div>
        </div>
      </div>

      {/* Issue Management List Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-slate-100">Manage Issue Queue</h3>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {['all', 'open', 'in_progress', 'resolved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'in_progress' ? 'In Progress' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Table / Mobile Card List */}
        {isLoading ? (
          <SkeletonFeed count={4} />
        ) : issues.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No issues found matching status filter "{formatStatus(statusFilter)}".
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge category={issue.category} />
                    <StatusPill status={issue.status} />
                    <span className="text-[11px] text-slate-500">
                      {formatTimeAgo(issue.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Location: <span className="text-slate-300 font-medium">{issue.location}</span> •
                    Reported by: <span className="text-slate-300 font-medium">{issue.reportedBy?.name || 'Student'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <Link
                    to={`/issues/${issue._id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold transition-all"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && issues.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.totalItems}
            limit={paginationData.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
