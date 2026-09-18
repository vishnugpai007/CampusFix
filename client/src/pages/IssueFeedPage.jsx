import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { parseApiError } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo } from '../utils/formatters';

import StatusPill from '../components/ui/StatusPill';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonFeed } from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import HeroSection from '../components/ui/hero-section';
import { FlowButton } from '../components/ui/flow-button';

import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ThumbsUp,
  MapPin,
  Clock,
  MessageSquare,
  XCircle,
  PlusCircle,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'electricity', label: 'Electricity' },
  { id: 'water', label: 'Water' },
  { id: 'mess', label: 'Mess' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'cleanliness', label: 'Cleanliness' },
  { id: 'security', label: 'Security' },
  { id: 'other', label: 'Other' }
];

const STATUSES = [
  { id: 'all', label: 'All Statuses' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'rejected', label: 'Rejected' }
];

const IssueFeedPage = () => {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const [issues, setIssues] = useState([]);
  const [paginationData, setPaginationData] = useState({ totalPages: 1, totalItems: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch issues from API
  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 9,
        sort: sortBy
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await api.get('/issues', { params });
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
      setError(parsed.message);
      toast.error(parsed.message || 'Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, debouncedSearch, selectedCategory, selectedStatus, toast]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedStatus, sortBy]);

  // Optimistic upvoting directly from card
  const handleUpvoteToggle = async (e, issueId, isUpvoted, currentCount) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic state update
    setIssues((prev) =>
      prev.map((item) => {
        if (item._id === issueId) {
          return {
            ...item,
            hasUpvoted: !isUpvoted,
            upvotesCount: isUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1
          };
        }
        return item;
      })
    );

    try {
      const res = await api.post(`/issues/${issueId}/upvote`);
      const updatedIssue = res.data.data;
      setIssues((prev) =>
        prev.map((item) => (item._id === issueId ? { ...item, ...updatedIssue } : item))
      );
    } catch (err) {
      // Rollback optimistic update
      setIssues((prev) =>
        prev.map((item) => {
          if (item._id === issueId) {
            return {
              ...item,
              hasUpvoted: isUpvoted,
              upvotesCount: currentCount
            };
          }
          return item;
        })
      );
      toast.error('Could not update upvote. Please try again.');
    }
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' || selectedCategory !== 'all' || selectedStatus !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>Campus Issues Feed</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, upvote, and track maintenance issues across campus
          </p>
        </div>
        <Link to="/issues/new">
          <FlowButton text="Report New Issue" />
        </Link>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm backdrop-blur-md">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Debounced Search Box */}
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by title, description or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-48 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
              <option value="most_upvoted">Most Upvoted</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Filter Chips: Category & Status */}
        <div className="space-y-3 pt-2 border-t border-slate-800/60">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              Status:
            </span>
            {STATUSES.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedStatus === st.id
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Content Area */}
      {isLoading ? (
        <SkeletonFeed count={6} />
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-300">
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={fetchIssues}
            className="mt-3 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Retry Fetching
          </button>
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching issues found' : 'No issues reported yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting or clearing your active search filters.'
              : 'Be the first to report an issue in your campus block!'
          }
          actionLabel={hasActiveFilters ? 'Reset Filters' : 'Report Issue'}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {issues.map((issue) => {
            const hasUpvoted = issue.hasUpvoted || issue.isUpvotedByCurrentUser;
            const upvoteCount = issue.upvotesCount ?? issue.upvotes?.length ?? 0;

            return (
              <Link
                key={issue._id}
                to={`/issues/${issue._id}`}
                className="group bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/5 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge category={issue.category} />
                    <StatusPill status={issue.status} />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-base font-semibold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                      {issue.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Thumbnail Preview if issue has image */}
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

                {/* Card Footer: Metadata & Upvote Action */}
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

                  {/* Upvote Button */}
                  <button
                    onClick={(e) => handleUpvoteToggle(e, issue._id, hasUpvoted, upvoteCount)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      hasUpvoted
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-sm'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    title={hasUpvoted ? 'Remove upvote' : 'Upvote this issue'}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-sky-400' : ''}`} />
                    <span>{upvoteCount}</span>
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
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

export default IssueFeedPage;
