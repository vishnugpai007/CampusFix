import { User } from '../src/models/user.model.js';
import { Issue } from '../src/models/issue.model.js';
import { Comment } from '../src/models/comment.model.js';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('Testing User Model...');
  const user = new User({
    name: 'Test Student',
    email: 'STUDENT@Campus.edu',
    password: 'password123',
    role: 'student',
    hostelBlock: 'Block A'
  });

  // Verify email lowercase transformation
  if (user.email !== 'student@campus.edu') {
    throw new Error('Email was not converted to lowercase');
  }

  // Test password hashing pre-save logic manually
  user.password = await bcrypt.hash(user.password, 12);
  if (!user.password.startsWith('$2')) {
    throw new Error('Password was not hashed correctly');
  }

  // Compare password test
  const isMatch = await user.comparePassword('password123');
  const isWrongMatch = await user.comparePassword('wrongpassword');
  if (!isMatch || isWrongMatch) {
    throw new Error('comparePassword failed');
  }

  // JWT generation test
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  if (!accessToken || !refreshToken) {
    throw new Error('JWT generation failed');
  }

  // toJSON test
  const userJson = user.toJSON();
  if (userJson.password || userJson.refreshToken || userJson.__v) {
    throw new Error('toJSON failed to strip sensitive fields');
  }
  console.log('User Model PASSED!');

  console.log('\nTesting Issue Model...');
  const issue = new Issue({
    title: 'WiFi Outage in Hostel A',
    description: 'The 3rd floor access point has been completely down since morning.',
    category: 'wifi',
    location: 'Hostel Block A, 3rd Floor',
    reportedBy: user._id,
    upvotes: [user._id]
  });

  if (issue.upvoteCount !== 1) {
    throw new Error(`upvoteCount virtual calculation failed: expected 1, got ${issue.upvoteCount}`);
  }
  console.log('Issue Model PASSED! Virtual upvoteCount:', issue.upvoteCount);

  console.log('\nTesting Comment Model...');
  const comment = new Comment({
    issue: issue._id,
    author: user._id,
    text: 'Staff has been notified. Technician on the way.'
  });

  if (!comment.text) {
    throw new Error('Comment model instantiation failed');
  }
  console.log('Comment Model PASSED!');

  console.log('\nALL MODEL TESTS PASSED SUCCESSFULLY!');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('MODEL TEST FAILED:', err);
    process.exit(1);
  });
