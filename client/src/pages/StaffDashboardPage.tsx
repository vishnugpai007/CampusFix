import React, { useState, useEffect, useCallback } from 'react';
import api, { parseApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import StatusPill from '../components/ui/StatusPill';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonFeed } from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import { formatTimeAgo } from '../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  RefreshCw,
  Edit3
} from 'lucide-react';

interface IssueItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reportedBy?: { name: string; hostelBlock?: string };
}

export const StaffDashboardPage: React.FC = () => {
  const toast = useToast();
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (activeStatus !== 'all') params.status = activeStatus;

      const res = await api.get('/issues', { params });
      if (res.data?.success) {
        setIssues(res.data.data.issues || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load staff issue queue');
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, toast]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await api.patch(`/issues/${id}/status`, {
        status: newStatus,
        resolutionNote
      });
      if (res.data?.success) {
        toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
        setUpdatingId(null);
        setResolutionNote('');
        fetchIssues();
      }
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Staff Issue Operations</h1>
            <p className="text-xs sm:text-sm text-slate-600">Review open tickets, assign priorities, and update status</p>
          </div>
        </div>

        <button
          onClick={fetchIssues}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
        {[
          { id: 'all', label: 'All Tickets' },
          { id: 'open', label: 'Open' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'resolved', label: 'Resolved' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveStatus(tab.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeStatus === tab.id
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue List */}
      {loading ? (
        <SkeletonFeed count={3} />
      ) : issues.length === 0 ? (
        <EmptyState title="No maintenance tickets found" description="The current status queue is empty." />
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue._id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{issue.category.replace('_', ' ')}</Badge>
                    <StatusPill status={issue.status} />
                    {issue.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">HIGH PRIORITY</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{issue.title}</h3>
                </div>

                <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimeAgo(issue.createdAt)}
                </span>
              </div>

              <p className="text-sm text-slate-700">{issue.description}</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {issue.location}
                  </span>
                  {issue.reportedBy && (
                    <span>Reported by: <strong className="text-slate-900 font-semibold">{issue.reportedBy.name}</strong></span>
                  )}
                </div>

                {/* Status Action controls */}
                <div className="flex items-center gap-2">
                  {updatingId === issue._id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        placeholder="Resolution note (optional)"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleStatusUpdate(issue._id, 'in_progress')}
                        className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-semibold transition-all border border-amber-300"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(issue._id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-semibold transition-all border border-emerald-300"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => setUpdatingId(null)}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setUpdatingId(issue._id);
                        setResolutionNote('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Update Status</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
};

export default StaffDashboardPage;
