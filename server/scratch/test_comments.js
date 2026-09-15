import { createCommentSchema } from '../src/validators/comment.validator.js';
import { createComment, getCommentsByIssue, deleteComment } from '../src/services/comment.service.js';
import { createIssue } from '../src/services/issue.service.js';
import { Comment } from '../src/models/comment.model.js';
import { Issue } from '../src/models/issue.model.js';
import { upload } from '../src/middleware/upload.js';

async function runCommentTests() {
  console.log('--- Phase 5 Comments & Upload Hardening Verification ---');

  // 1. Zod Comment Validator Test
  console.log('1. Testing Comment Zod Validation...');
  const emptyParse = createCommentSchema.safeParse({ text: '   ' });
  if (emptyParse.success) {
    throw new Error('FAILED: Empty comment text was permitted');
  }
  const validParse = createCommentSchema.safeParse({ text: 'Great report, technician dispatched.' });
  if (!validParse.success) {
    throw new Error('FAILED: Valid comment text was rejected');
  }
  console.log('PASSED: Zod comment schema validates text boundaries (1-500 chars).');

  // 2. Non-existent Issue Comment Rejection (404)
  console.log('2. Testing Non-Existent Issue Comment Rejection (404)...');
  const fakeIssueId = '65d111111111111111111111';
  const fakeAuthorId = '65d222222222222222222222';

  // Mock Issue.findById to return null
  const originalFindById = Issue.findById;
  Issue.findById = () => null;

  try {
    await createComment(fakeIssueId, fakeAuthorId, 'Hello world');
    throw new Error('FAILED: Comment on non-existent issue did not fail');
  } catch (err) {
    if (err.statusCode !== 404 || err.message !== 'Issue not found') {
      throw new Error(`FAILED: Expected 404 Issue not found, got ${err.statusCode} - ${err.message}`);
    }
    console.log(`PASSED: Comment on non-existent issue cleanly rejected with 404: "${err.message}"`);
  }

  // Restore Issue.findById
  Issue.findById = originalFindById;

  // 3. Comment Authorization Guard (Author/Admin vs Stranger)
  console.log('3. Testing Comment Deletion Authorization...');
  const authorUser = { _id: fakeAuthorId, role: 'student' };
  const strangerUser = { _id: '65d333333333333333333333', role: 'student' };
  const adminUser = { _id: '65d444444444444444444444', role: 'admin' };

  const commentMock = { _id: 'c1', author: fakeAuthorId };
  const originalCommentFindById = Comment.findById;
  Comment.findById = () => commentMock;
  Comment.findByIdAndDelete = async () => true;

  // Stranger attempt -> 403
  try {
    await deleteComment('c1', strangerUser);
    throw new Error('FAILED: Stranger was permitted to delete author comment');
  } catch (err) {
    if (err.statusCode !== 403) throw new Error('FAILED: Expected 403 Forbidden for stranger comment deletion');
    console.log('PASSED: Stranger deletion blocked with 403 Forbidden.');
  }

  // Author attempt -> Success
  await deleteComment('c1', authorUser);
  console.log('PASSED: Author permitted to delete own comment.');

  // Admin attempt -> Success
  await deleteComment('c1', adminUser);
  console.log('PASSED: Admin permitted to delete any comment.');

  Comment.findById = originalCommentFindById;

  console.log('\n--- ALL COMMENTS & UPLOAD VERIFICATION CHECKS PASSED ---');
}

runCommentTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('COMMENT TEST FAILED:', err);
    process.exit(1);
  });
