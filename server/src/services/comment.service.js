import { Comment } from '../models/comment.model.js';
import { Issue } from '../models/issue.model.js';
import { ApiError } from '../utils/ApiError.js';
import { isOwnerOrStaffOrAdmin } from '../utils/authHelpers.js';

export const createComment = async (issueId, authorId, text) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  const comment = new Comment({
    issue: issueId,
    author: authorId,
    text
  });

  await comment.save();
  return comment.populate('author', 'name email role');
};

export const getCommentsByIssue = async (issueId, queryParams = {}) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  // Enforce pagination boundaries at service level
  const safePage = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const safeLimit = Math.min(Math.max(1, parseInt(queryParams.limit, 10) || 10), 50);

  const skip = (safePage - 1) * safeLimit;

  const [comments, total] = await Promise.all([
    Comment.find({ issue: issueId })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Comment.countDocuments({ issue: issueId })
  ]);

  const totalPages = Math.ceil(total / safeLimit) || 1;

  return {
    comments,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1
    }
  };
};

export const deleteComment = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Deduplicated ownership check allowing author, staff, or admin to delete comment
  if (!isOwnerOrStaffOrAdmin(comment.author, user)) {
    throw new ApiError(403, 'Forbidden: You do not have permission to delete this comment');
  }

  await Comment.findByIdAndDelete(commentId);
};
