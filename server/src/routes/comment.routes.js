import { Router } from 'express';

import * as commentController from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createCommentSchema, commentQuerySchema } from '../validators/comment.validator.js';

// Router configured with mergeParams: true to access issueId from parent routes
const router = Router({ mergeParams: true });

router.use(authenticate);

// Nested routes: /api/v1/issues/:issueId/comments
router
  .route('/')
  .post(validate(createCommentSchema), commentController.createComment)
  .get(validate(commentQuerySchema, 'query'), commentController.getComments);

// Direct comment route: /api/v1/comments/:id
export const commentItemRouter = Router();
commentItemRouter.use(authenticate);
commentItemRouter.delete('/:id', commentController.deleteComment);

export default router;
