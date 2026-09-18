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
  Building2,
  ShieldAlert,
  ListFilter,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Lock,
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

export const HostDashboardPage: React.FC = () => {
  const toast = useToast();
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ragging_desk'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (activeTab === 'ragging_desk') {
        params.category = 'ragging_desk';
      }

      const res = await api.get('/issues', { params });
      if (res.data?.success) {
        setIssues(res.data.data.issues || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load host dashboard queue');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, toast]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Host Management Command</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                Full Authorization
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">Oversee campus maintenance queues & review confidential Ragging Desk reports</p>
          </div>
        </div>

        <button
          onClick={fetchIssues}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Primary Host Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>All Maintenance Tickets</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ragging_desk');
            setPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ragging_desk'
              ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
              : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Confidential Ragging Desk Reports</span>
          <Lock className="w-3 h-3 text-rose-600 ml-1" />
        </button>
      </div>

      {/* Queue List */}
      {loading ? (
        <SkeletonFeed count={3} />
      ) : issues.length === 0 ? (
        <EmptyState
          title={activeTab === 'ragging_desk' ? 'No confidential ragging desk reports' : 'No tickets found'}
          description={
            activeTab === 'ragging_desk'
              ? 'No confidential issues have been submitted to the Ragging Desk.'
              : 'The general maintenance queue is currently clear.'
          }
        />
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => {
            const isRagging = issue.category === 'ragging_desk';
            return (
              <div
                key={issue._id}
                className={`p-6 rounded-2xl transition-all ${
                  isRagging
                    ? 'bg-rose-50/70 border border-rose-200 shadow-sm'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={isRagging ? 'secondary' : 'outline'}>
                        {isRagging ? 'RAGGING DESK' : issue.category.replace('_', ' ')}
                      </Badge>
                      <StatusPill status={issue.status} />
                      {isRagging && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> HOST CONFIDENTIAL
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{issue.title}</h3>
                  </div>

                  <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimeAgo(issue.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-slate-700 mb-4">{issue.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {issue.location}
                    </span>
                    {issue.reportedBy && (
                      <span>
                        Reporter:{' '}
                        <strong className="text-slate-900 font-semibold">
                          {issue.reportedBy.name} {issue.reportedBy.hostelBlock ? `(${issue.reportedBy.hostelBlock})` : ''}
                        </strong>
                      </span>
                    )}
                  </div>

                  {/* Host Action controls */}
                  <div className="flex items-center gap-2">
                    {updatingId === issue._id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          placeholder="Resolution note / action taken"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Host Action</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
};

export default HostDashboardPage;
