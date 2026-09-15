import { Issue } from '../models/issue.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadImageStream, deleteImage } from '../config/cloudinary.js';
import { isOwnerOrAdmin } from '../utils/authHelpers.js';

export { isOwnerOrAdmin };

export const createIssue = async (userId, issueData, fileBuffer) => {
  let uploadResult = null;

  if (fileBuffer) {
    // 1. Upload to Cloudinary stream first
    uploadResult = await uploadImageStream(fileBuffer);
  }

  // Mass assignment hardening: Whitelist allowed user fields only
  const { title, description, category, location, priority } = issueData;

  try {
    // 2. Attempt database document persistence with sanitized payload
    const issue = new Issue({
      title,
      description,
      category,
      location,
      priority: priority || 'medium',
      reportedBy: userId,
      status: 'open', // Always force open state on creation
      imageUrl: uploadResult?.secure_url || '',
      imagePublicId: uploadResult?.public_id || ''
    });

    await issue.save();
    return issue.populate('reportedBy', 'name email hostelBlock');
  } catch (dbError) {
    // 3. Rollback: Destroy newly uploaded Cloudinary image if DB save fails
    if (uploadResult?.public_id) {
      await deleteImage(uploadResult.public_id);
    }
    throw dbError;
  }
};

export const getIssues = async (queryParams = {}, currentUserId) => {
  const { status, category, priority, search, sort, mine } = queryParams;

  // Enforce pagination upper and lower boundaries at service level
  const safePage = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const safeLimit = Math.min(Math.max(1, parseInt(queryParams.limit, 10) || 10), 50);

  const query = {};
  if (status && typeof status === 'string') query.status = status;
  if (category && typeof category === 'string') query.category = category;
  if (priority && typeof priority === 'string') query.priority = priority;
  if (search && typeof search === 'string' && search.trim()) {
    query.$text = { $search: search.trim() };
  }
  if (mine) query.reportedBy = currentUserId;

  let sortObj = { createdAt: -1 };
  if (sort === 'oldest') sortObj = { createdAt: 1 };
  if (sort === 'most_upvoted') sortObj = { upvotes: -1, createdAt: -1 };

  const skip = (safePage - 1) * safeLimit;

  const [issues, total] = await Promise.all([
    Issue.find(query)
      .populate('reportedBy', 'name email hostelBlock')
      .populate('assignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Issue.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / safeLimit) || 1;

  return {
    issues,
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

export const getIssueById = async (issueId) => {
  const issue = await Issue.findById(issueId)
    .populate('reportedBy', 'name email hostelBlock')
    .populate('assignedTo', 'name email');

  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  return issue;
};

export const updateIssue = async (issueId, user, updateData) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  if (issue.reportedBy.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Only the original reporter can edit this issue');
  }

  if (issue.status !== 'open') {
    throw new ApiError(400, 'Cannot edit an issue once processing has started or it is resolved');
  }

  // Mass assignment hardening: Whitelist allowed edit fields strictly
  const allowedFields = ['title', 'description', 'category', 'location', 'priority'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      issue[field] = updateData[field];
    }
  });

  await issue.save();
  return issue.populate('reportedBy', 'name email hostelBlock');
};

export const deleteIssue = async (issueId, user) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  if (!isOwnerOrAdmin(issue.reportedBy, user)) {
    throw new ApiError(403, 'Forbidden: You do not have permission to delete this issue');
  }

  if (issue.imagePublicId) {
    await deleteImage(issue.imagePublicId);
  }

  await Issue.findByIdAndDelete(issueId);
};

export const updateIssueStatus = async (issueId, { status, resolutionNote }) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  if (['resolved', 'rejected'].includes(status) && !resolutionNote) {
    throw new ApiError(400, 'Resolution note is required when resolving or rejecting an issue');
  }

  issue.status = status;
  if (resolutionNote !== undefined) {
    issue.resolutionNote = resolutionNote;
  }
  if (status === 'resolved') {
    issue.resolvedAt = new Date();
  }

  await issue.save();
  return issue.populate('reportedBy', 'name email hostelBlock').then((doc) => doc.populate('assignedTo', 'name email'));
};

export const assignIssue = async (issueId, staffUserId) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  const staffUser = await User.findById(staffUserId);
  if (!staffUser || staffUser.role !== 'staff') {
    throw new ApiError(400, 'Target user is not a valid staff member');
  }

  issue.assignedTo = staffUserId;
  await issue.save();

  return issue.populate('assignedTo', 'name email');
};

export const toggleUpvote = async (issueId, userId) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw new ApiError(404, 'Issue not found');
  }

  if (issue.reportedBy.toString() === userId.toString()) {
    throw new ApiError(400, 'You cannot upvote your own reported issue');
  }

  const userObjectIdStr = userId.toString();
  const upvoteIndex = issue.upvotes.findIndex((id) => id.toString() === userObjectIdStr);

  if (upvoteIndex > -1) {
    issue.upvotes.splice(upvoteIndex, 1);
  } else {
    issue.upvotes.push(userId);
  }

  await issue.save();
  return issue;
};

export const getIssueStats = async () => {
  const [byStatus, byCategory, avgRes] = await Promise.all([
    Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Issue.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Issue.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
      { $project: { durationMs: { $subtract: ['$resolvedAt', '$createdAt'] } } },
      { $group: { _id: null, avgMs: { $avg: '$durationMs' } } }
    ])
  ]);

  return {
    byStatus: byStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    byCategory: byCategory.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    avgResolutionTimeMs: Math.round(avgRes[0]?.avgMs || 0)
  };
};
