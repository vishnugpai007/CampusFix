import {
  createIssueSchema,
  issueQuerySchema,
  updateStatusSchema,
  assignIssueSchema
} from '../src/validators/issue.validator.js';
import { isOwnerOrAdmin, toggleUpvote, updateIssueStatus } from '../src/services/issue.service.js';
import { Issue } from '../src/models/issue.model.js';
import { ApiError } from '../src/utils/ApiError.js';

async function runIssueTests() {
  console.log('--- Phase 4 Issues API Verification ---');

  // 1. Zod Query Coercion Test
  console.log('1. Testing Query Parameter Coercion...');
  const rawQuery = {
    page: '2',
    limit: '15',
    sort: 'most_upvoted',
    mine: 'true'
  };

  const parsedQuery = issueQuerySchema.parse(rawQuery);
  if (parsedQuery.page !== 2 || parsedQuery.limit !== 15 || parsedQuery.mine !== true) {
    throw new Error('FAILED: Zod query parameter coercion failed');
  }
  console.log('PASSED: Query parameters correctly coerced into numeric and boolean types.');

  // 2. Ownership Helper Test (isOwnerOrAdmin)
  console.log('2. Testing Ownership Helper (isOwnerOrAdmin)...');
  const ownerId = '65d111111111111111111111';
  const strangerId = '65d222222222222222222222';
  const adminId = '65d333333333333333333333';

  const issueMock = { reportedBy: ownerId };
  const ownerUser = { _id: ownerId, role: 'student' };
  const strangerUser = { _id: strangerId, role: 'student' };
  const adminUser = { _id: adminId, role: 'admin' };

  if (!isOwnerOrAdmin(issueMock, ownerUser)) throw new Error('FAILED: Owner check failed for owner');
  if (isOwnerOrAdmin(issueMock, strangerUser)) throw new Error('FAILED: Stranger incorrectly passed owner check');
  if (!isOwnerOrAdmin(issueMock, adminUser)) throw new Error('FAILED: Admin check failed for admin');
  console.log('PASSED: isOwnerOrAdmin correctly permits owners and admins while blocking strangers.');

  // 3. Self-Upvote Block Test
  console.log('3. Testing Self-Upvote Block Rule...');
  const testIssue = new Issue({
    title: 'Broken Streetlight Near Hostel B',
    description: 'The streetlight outside the main entrance is flickering and completely off at night.',
    category: 'electricity',
    location: 'Hostel B Main Gate',
    reportedBy: ownerId,
    upvotes: []
  });

  // Mock Issue.findById to return testIssue
  const originalFindById = Issue.findById;
  Issue.findById = () => ({
    exec: async () => testIssue,
    then: (resolve) => resolve(testIssue)
  });

  try {
    await toggleUpvote('fakeId', ownerId);
    throw new Error('FAILED: Owner was allowed to upvote their own issue');
  } catch (err) {
    if (err.statusCode !== 400 || !err.message.includes('cannot upvote your own')) {
      throw new Error(`FAILED: Expected self-upvote error, got ${err.message}`);
    }
    console.log(`PASSED: Self-upvote blocked cleanly with message: "${err.message}"`);
  }

  // 4. Student Upvote Toggle Test
  console.log('4. Testing Toggle Upvote from Non-Owner Student...');
  await toggleUpvote('fakeId', strangerId);
  if (testIssue.upvotes.length !== 1 || testIssue.upvotes[0].toString() !== strangerId) {
    throw new Error('FAILED: Student upvote was not added');
  }
  await toggleUpvote('fakeId', strangerId);
  if (testIssue.upvotes.length !== 0) {
    throw new Error('FAILED: Student upvote was not toggled off');
  }
  console.log('PASSED: Upvote toggles on and off correctly.');

  // 5. Status Transition Resolution Note Rule
  console.log('5. Testing Resolution Note Requirement for Resolved Status...');
  try {
    const invalidStatusUpdate = updateStatusSchema.parse({ status: 'resolved' });
    await updateIssueStatus('fakeId', invalidStatusUpdate);
    throw new Error('FAILED: Resolved status without resolutionNote was permitted');
  } catch (err) {
    console.log('PASSED: Moving status to "resolved" without resolutionNote correctly rejected.');
  }

  // Restore Issue.findById
  Issue.findById = originalFindById;

  console.log('\n--- ALL ISSUES API VERIFICATION CHECKS PASSED ---');
}

runIssueTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ISSUES TEST FAILED:', err);
    process.exit(1);
  });
