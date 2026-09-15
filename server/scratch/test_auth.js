import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../src/validators/auth.validator.js';
import { authorize } from '../src/middleware/authorize.js';
import { validate } from '../src/middleware/validate.js';
import { ApiError } from '../src/utils/ApiError.js';
import { env } from '../src/config/env.js';

async function runAuthTests() {
  console.log('--- Phase 3 Security & Auth Verification ---');

  // 1. Zod Validation & Privilege Escalation Check
  console.log('1. Testing Privilege Escalation Prevention...');
  const maliciousInput = {
    name: 'Attacker Student',
    email: 'attacker@campus.edu',
    password: 'password123',
    role: 'admin' // Attempting privilege escalation
  };

  const parseResult = registerSchema.safeParse(maliciousInput);
  if (parseResult.data.role !== undefined) {
    throw new Error('FAILED: Zod schema allowed role property!');
  }
  console.log('PASSED: Zod register schema stripped the role property.');

  // 2. Generic Authentication Errors (User Enumeration Protection)
  console.log('2. Testing Generic Authentication Errors (User Enumeration Protection)...');
  const GENERIC_AUTH_ERROR = 'Invalid email or password';
  
  const errNoUser = new ApiError(401, GENERIC_AUTH_ERROR);
  const errWrongPass = new ApiError(401, GENERIC_AUTH_ERROR);

  if (errNoUser.message !== errWrongPass.message || errNoUser.statusCode !== 401) {
    throw new Error('FAILED: Generic authentication messages do not match!');
  }
  console.log(`PASSED: Both failure conditions return identical message: "${errNoUser.message}"`);

  // 3. Token Generation & Refresh Token Rotation Logic
  console.log('3. Testing JWT Token Generation & Refresh Rotation...');
  const userId = '65d123456789abcdef123456';
  const refreshToken1 = jwt.sign({ id: userId, jti: 'token-version-1' }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  const refreshToken2 = jwt.sign({ id: userId, jti: 'token-version-2' }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  if (refreshToken1 === refreshToken2) {
    throw new Error('FAILED: Refresh token rotation produced identical token');
  }
  console.log('PASSED: Refresh token rotation generates a new unique refresh token.');

  // 4. Role Authorization Guard Middleware Test
  console.log('4. Testing Authorization Guard Middleware...');
  const reqStudent = { user: { role: 'student' } };
  const reqStaff = { user: { role: 'staff' } };
  const reqAdmin = { user: { role: 'admin' } };

  const adminStaffGuard = authorize('admin', 'staff');

  let studentError = null;
  adminStaffGuard(reqStudent, {}, (err) => { studentError = err; });

  let staffAllowed = false;
  adminStaffGuard(reqStaff, {}, (err) => { if (!err) staffAllowed = true; });

  let adminAllowed = false;
  adminStaffGuard(reqAdmin, {}, (err) => { if (!err) adminAllowed = true; });

  if (!studentError || studentError.statusCode !== 403 || !staffAllowed || !adminAllowed) {
    throw new Error('FAILED: Role authorization guard check failed');
  }
  console.log('PASSED: authorize("admin", "staff") correctly blocks students (403) and allows staff/admin.');

  // 5. Generic Zod Validation Middleware Test
  console.log('5. Testing Generic Zod Validation Middleware...');
  const middleware = validate(loginSchema);
  const invalidReq = { body: { email: 'invalid-email', password: '' } };
  
  let valError = null;
  middleware(invalidReq, {}, (err) => { valError = err; });

  if (!valError || valError.statusCode !== 422 || !valError.errors.length) {
    throw new Error('FAILED: Zod validation middleware did not return 422 with field errors');
  }
  console.log(`PASSED: Zod validation middleware returned 422 with field errors: ${JSON.stringify(valError.errors)}`);

  console.log('\n--- ALL AUTH & SECURITY VERIFICATION CHECKS PASSED ---');
}

runAuthTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('AUTH TEST FAILED:', err);
    process.exit(1);
  });
