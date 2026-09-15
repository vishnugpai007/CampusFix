import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as commentService from '../services/comment.service.js';

export const createComment = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const { text } = req.body;
  const comment = await commentService.createComment(issueId, req.user._id, text);
  return res.status(201).json(new ApiResponse(201, comment, 'Comment posted successfully'));
});

export const getComments = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const result = await commentService.getCommentsByIssue(issueId, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Comments retrieved successfully'));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await commentService.deleteComment(id, req.user);
  return res.status(200).json(new ApiResponse(200, {}, 'Comment deleted successfully'));
});
