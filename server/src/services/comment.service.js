import { Comment } from '../models/comment.model.js';
import { Issue } from '../models/issue.model.js';
import { ApiError } from '../utils/ApiError.js';

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

export const getCommentsByIssue = async (issueId, { page = 1, limit = 10 }) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  const skip = (page - 1) * limit;

  // Concurrent execution using Promise.all and .lean() for read performance optimization
  const [comments, total] = await Promise.all([
    Comment.find({ issue: issueId })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments({ issue: issueId })
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

export const deleteComment = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.author.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden: You do not have permission to delete this comment');
  }

  await Comment.findByIdAndDelete(commentId);
};
