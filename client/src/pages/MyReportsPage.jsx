import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { parseApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo } from '../utils/formatters';

import StatusPill from '../components/ui/StatusPill';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonFeed } from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';

import { FolderOpen, PlusCircle, ThumbsUp, MapPin, Clock } from 'lucide-react';

const MyReportsPage = () => {
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationData, setPaginationData] = useState({ totalPages: 1, totalItems: 0, limit: 9 });

  const fetchMyIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/issues', {
        params: {
          mine: 'true',
          page,
          limit: 9,
          sort: 'newest'
        }
      });
      const { issues: items, pagination } = response.data.data;
      setIssues(items || []);
      if (pagination) {
        setPaginationData({
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.total || items.length,
          limit: pagination.limit || 9
        });
      }
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || 'Failed to load your reported issues');
    } finally {
      setIsLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <FolderOpen className="w-7 h-7 text-sky-400" />
            <span>My Reported Issues</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track resolution status and updates for issues you submitted
          </p>
        </div>
        <Link
          to="/issues/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-sky-500/10 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Feed Area */}
      {isLoading ? (
        <SkeletonFeed count={6} />
      ) : issues.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No reported issues yet"
          description="You haven't submitted any maintenance requests. Spot something broken? Help your campus by submitting a report."
          actionLabel="Report Your First Issue"
          onAction={() => window.location.assign('/issues/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {issues.map((issue) => {
            const upvoteCount = issue.upvotesCount ?? issue.upvotes?.length ?? 0;
            return (
              <Link
                key={issue._id}
                to={`/issues/${issue._id}`}
                className="group bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/5 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge category={issue.category} />
                    <StatusPill status={issue.status} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                      {issue.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {issue.imageUrl && (
                    <div className="overflow-hidden rounded-xl h-36 bg-slate-950 border border-slate-800">
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-[160px]">
                        {issue.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{formatTimeAgo(issue.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 text-slate-400 border border-slate-800">
                    <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>{upvoteCount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
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
  );
};

export default MyReportsPage;
