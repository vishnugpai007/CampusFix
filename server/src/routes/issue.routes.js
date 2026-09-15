import { Router } from 'express';

import * as issueController from '../controllers/issue.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import {
  createIssueSchema,
  updateIssueSchema,
  issueQuerySchema,
  updateStatusSchema,
  assignIssueSchema
} from '../validators/issue.validator.js';

const router = Router();

// Require authentication for all issue routes
router.use(authenticate);

// Aggregated stats endpoint (must be defined before /:id)
router.get('/stats/summary', authorize('staff', 'admin'), issueController.getStatsSummary);

// Base issue collection endpoints
router
  .route('/')
  .post(uploadRateLimiter, upload.single('image'), validate(createIssueSchema), issueController.createIssue)
  .get(validate(issueQuerySchema, 'query'), issueController.getIssues);

// Individual issue endpoints
router
  .route('/:id')
  .get(issueController.getIssueById)
  .patch(validate(updateIssueSchema), issueController.updateIssue)
  .delete(issueController.deleteIssue);

// Workflow state & action endpoints
router.patch('/:id/status', authorize('staff', 'admin'), validate(updateStatusSchema), issueController.updateStatus);
router.patch('/:id/assign', authorize('admin'), validate(assignIssueSchema), issueController.assignIssue);
router.post('/:id/upvote', issueController.toggleUpvote);

export default router;
