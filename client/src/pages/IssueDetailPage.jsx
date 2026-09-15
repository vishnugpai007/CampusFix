import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { parseApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo, formatStatus } from '../utils/formatters';

import StatusPill from '../components/ui/StatusPill';
import Badge from '../components/ui/Badge';
import {
  ArrowLeft,
  ThumbsUp,
  MapPin,
  Clock,
  User,
  MessageSquare,
  Send,
  Trash2,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

const IssueDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Status Change Panel State (Staff/Admin)
  const [selectedStatus, setSelectedStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');

  // Fetch issue details & comment thread
  const fetchIssueDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const issueRes = await api.get(`/issues/${id}`);
      const fetchedIssue = issueRes.data.data;
      setIssue(fetchedIssue);
      setSelectedStatus(fetchedIssue.status);
      setResolutionNote(fetchedIssue.resolutionNote || '');

      // Fetch comments for this issue
      try {
        const commentRes = await api.get(`/issues/${id}/comments`);
        setComments(commentRes.data.data?.comments || commentRes.data.data || []);
      } catch (commentErr) {
        // Non-critical if comments fail
      }
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || 'Issue not found');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, navigate]);

  useEffect(() => {
    fetchIssueDetails();
  }, [fetchIssueDetails]);

  // Optimistic Upvoting Handler
  const handleUpvote = async () => {
    if (!issue) return;

    const previousUpvotedState = issue.hasUpvoted || issue.isUpvotedByCurrentUser;
    const previousCount = issue.upvotesCount ?? issue.upvotes?.length ?? 0;

    const nextUpvotedState = !previousUpvotedState;
    const nextCount = previousUpvotedState ? Math.max(0, previousCount - 1) : previousCount + 1;

    // Apply Optimistic Update
    setIssue((prev) => ({
      ...prev,
      hasUpvoted: nextUpvotedState,
      isUpvotedByCurrentUser: nextUpvotedState,
      upvotesCount: nextCount
    }));

    try {
      const res = await api.post(`/issues/${id}/upvote`);
      const updatedData = res.data.data;
      setIssue((prev) => ({
        ...prev,
        ...updatedData
      }));
    } catch (err) {
      // Rollback on failure
      setIssue((prev) => ({
        ...prev,
        hasUpvoted: previousUpvotedState,
        isUpvotedByCurrentUser: previousUpvotedState,
        upvotesCount: previousCount
      }));
      toast.error('Failed to register upvote. Please try again.');
    }
  };

  // Add Comment Handler
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/issues/${id}/comments`, { text: newCommentText.trim() });
      const createdComment = res.data.data;
      setComments((prev) => [createdComment, ...prev]);
      setNewCommentText('');
      toast.success('Comment added');
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Comment Handler
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Could not delete comment');
    }
  };

  // Status Change Handler (Staff/Admin Only)
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/issues/${id}/status`, {
        status: selectedStatus,
        resolutionNote: resolutionNote.trim() || undefined
      });
      const updatedIssue = res.data.data;
      setIssue((prev) => ({ ...prev, ...updatedIssue }));
      toast.success(`Status updated to ${formatStatus(selectedStatus)}`);
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading issue details...</p>
      </div>
    );
  }

  if (!issue) return null;

  const hasUpvoted = issue.hasUpvoted || issue.isUpvotedByCurrentUser;
  const upvoteCount = issue.upvotesCount ?? issue.upvotes?.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge category={issue.category} />
          <StatusPill status={issue.status} />
        </div>
      </div>

      {/* Main Issue Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-xl">
        {/* Title and Metadata Header */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            {issue.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Reported by </span>
              <span className="font-semibold text-slate-200">
                {issue.reportedBy?.name || issue.authorName || 'Anonymous Student'}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium text-slate-200">{issue.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatTimeAgo(issue.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* High-res Image Display */}
        {issue.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-96 flex items-center justify-center">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
        )}

        {/* Full Issue Description */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Issue Description
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {issue.description}
          </p>
        </div>

        {/* Resolution Note if present */}
        {issue.resolutionNote && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Resolution Note
            </h4>
            <p className="text-xs sm:text-sm text-emerald-200">{issue.resolutionNote}</p>
          </div>
        )}

        {/* Action Bar (Upvote Button) */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              hasUpvoted
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-sm'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-slate-100'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-sky-400' : ''}`} />
            <span>{hasUpvoted ? 'Upvoted' : 'Upvote Issue'}</span>
            <span className="ml-1 text-xs opacity-75">({upvoteCount})</span>
          </button>

          <span className="text-xs text-slate-500 capitalize">Priority: {issue.priority || 'medium'}</span>
        </div>
      </div>

      {/* Staff / Admin Status Change Panel */}
      {isStaffOrAdmin && (
        <div className="bg-slate-900/80 border border-sky-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Staff / Admin Control Panel</span>
          </div>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Update Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Optional Resolution Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Resolution Note <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Technician replaced router, wifi restored"
                  className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingStatus || selectedStatus === issue.status}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Status...</span>
                </>
              ) : (
                <span>Update Issue Status</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Comment Thread Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-base sm:text-lg">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <span>Comments ({comments.length})</span>
        </div>

        {/* Post New Comment Form */}
        <form onSubmit={handlePostComment} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment or update on this issue..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment || !newCommentText.trim()}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmittingComment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* List of Comments */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No comments yet. Start the conversation!
            </p>
          ) : (
            comments.map((comment) => {
              const author = comment.author || comment.user || {};
              const authorId = author._id || comment.userId;
              const isOwner = user && (user._id === authorId || user.id === authorId);
              const canDelete = isOwner || isStaffOrAdmin;

              return (
                <div
                  key={comment._id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-sky-400">
                        {author.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        {author.name || 'Student'}
                      </span>
                      {author.role && author.role !== 'student' && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-semibold capitalize border border-sky-500/20">
                          {author.role}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 pl-9 leading-relaxed">
                    {comment.text || comment.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
