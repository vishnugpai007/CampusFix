import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as issueService from '../services/issue.service.js';

export const createIssue = asyncHandler(async (req, res) => {
  const fileBuffer = req.file?.buffer;
  const issue = await issueService.createIssue(req.user._id, req.body, fileBuffer);
  return res.status(201).json(new ApiResponse(201, issue, 'Issue reported successfully'));
});

export const getIssues = asyncHandler(async (req, res) => {
  const result = await issueService.getIssues(req.query, req.user._id);
  return res.status(200).json(new ApiResponse(200, result, 'Issues retrieved successfully'));
});

export const getIssueById = asyncHandler(async (req, res) => {
  const issue = await issueService.getIssueById(req.params.id);
  return res.status(200).json(new ApiResponse(200, issue, 'Issue details retrieved successfully'));
});

export const updateIssue = asyncHandler(async (req, res) => {
  const updatedIssue = await issueService.updateIssue(req.params.id, req.user, req.body);
  return res.status(200).json(new ApiResponse(200, updatedIssue, 'Issue updated successfully'));
});

export const deleteIssue = asyncHandler(async (req, res) => {
  await issueService.deleteIssue(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, {}, 'Issue deleted successfully'));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const updatedIssue = await issueService.updateIssueStatus(req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, updatedIssue, 'Issue status updated successfully'));
});

export const assignIssue = asyncHandler(async (req, res) => {
  const updatedIssue = await issueService.assignIssue(req.params.id, req.body.assignedTo);
  return res.status(200).json(new ApiResponse(200, updatedIssue, 'Issue assigned successfully'));
});

export const toggleUpvote = asyncHandler(async (req, res) => {
  const updatedIssue = await issueService.toggleUpvote(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, updatedIssue, 'Upvote toggled successfully'));
});

export const getStatsSummary = asyncHandler(async (req, res) => {
  const stats = await issueService.getIssueStats();
  return res.status(200).json(new ApiResponse(200, stats, 'Issue statistics retrieved successfully'));
});
