import { User, Role, UserStatus } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { authService } from '../services/auth.service';
import { hashToken } from '../utils/auth/token.util';
import assert from 'assert';

console.log('🧪 Starting EMS Foundation Verification Suite...');

// In-memory data store mimicking PostgreSQL database table
const mockDb = new Map<string, User>();

// Monkey patch userRepository singleton to execute in-memory operations
userRepository.createUser = async (data: any): Promise<User> => {
  const newUser: User = {
    id: 'user-uuid-1234',
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    phone: data.phone || null,
    role: data.role || Role.EMPLOYEE,
    status: UserStatus.ACTIVE,
    isEmailVerified: false,
    refreshTokenVersion: 0,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockDb.set(newUser.email, newUser);
  return newUser;
};

userRepository.findByEmail = async (email: string): Promise<User | null> => {
  return mockDb.get(email) || null;
};

userRepository.findById = async (id: string): Promise<User | null> => {
  for (const user of mockDb.values()) {
    if (user.id === id) return user;
  }
  return null;
};

userRepository.updateUser = async (id: string, data: any): Promise<User> => {
  let matchedUser: User | null = null;
  for (const user of mockDb.values()) {
    if (user.id === id) {
      // Handle Prisma counter increments natively
      let version = user.refreshTokenVersion;
      if (data.refreshTokenVersion?.increment) {
        version += data.refreshTokenVersion.increment;
      } else if (typeof data.refreshTokenVersion === 'number') {
        version = data.refreshTokenVersion;
      }

      matchedUser = {
        ...user,
        ...data,
        refreshTokenVersion: version
      };
      mockDb.set(user.email, matchedUser as User);
      break;
    }
  }
  if (!matchedUser) throw new Error('User not found');
  return matchedUser as User;
};

userRepository.findByResetToken = async (hashedToken: string): Promise<User | null> => {
  for (const user of mockDb.values()) {
    if (
      user.resetPasswordToken === hashedToken &&
      user.resetPasswordExpires &&
      user.resetPasswordExpires > new Date()
    ) {
      return user;
    }
  }
  return null;
};

// Execution Block
const runTests = async () => {
  // Test 1: Register User
  console.log('  1. Testing Registration...');
  const regResult = await authService.register({
    email: 'test@ems.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe'
  });
  assert.strictEqual(regResult.user.email, 'test@ems.com');
  assert.strictEqual(regResult.user.role, Role.EMPLOYEE);
  assert.ok(regResult.accessToken);
  assert.ok(regResult.refreshToken);
  console.log('     ✔ Registration succeeded.');

  // Test 2: Register Duplicate User (should fail)
  console.log('  2. Testing Duplicate Registration...');
  try {
    await authService.register({
      email: 'test@ems.com',
      password: 'AnotherPassword123!',
      firstName: 'Jane',
      lastName: 'Doe'
    });
    assert.fail('Should have failed for duplicate email');
  } catch (error: any) {
    assert.strictEqual(error.statusCode, 409);
    console.log('     ✔ Duplicate registration caught correctly.');
  }

  // Test 3: Login User
  console.log('  3. Testing Login...');
  const loginResult = await authService.login({
    email: 'test@ems.com',
    password: 'SecurePassword123!'
  });
  assert.strictEqual(loginResult.user.email, 'test@ems.com');
  assert.ok(loginResult.accessToken);
  console.log('     ✔ Login succeeded.');

  // Test 4: Login with incorrect password
  console.log('  4. Testing Invalid Password Login...');
  try {
    await authService.login({
      email: 'test@ems.com',
      password: 'WrongPassword!'
    });
    assert.fail('Should have failed with invalid credentials');
  } catch (error: any) {
    assert.strictEqual(error.statusCode, 401);
    console.log('     ✔ Invalid credentials caught correctly.');
  }

  // Test 5: Token Refresh
  console.log('  5. Testing Token Refresh...');
  const refreshResult = await authService.refresh(loginResult.refreshToken);
  assert.ok(refreshResult.accessToken);
  assert.ok(refreshResult.refreshToken);
  console.log('     ✔ Token rotation succeeded.');

  // Test 6: Invalidation via Logout
  console.log('  6. Testing Logout Revocation...');
  await authService.logout(loginResult.user.id);
  try {
    await authService.refresh(loginResult.refreshToken);
    assert.fail('Refresh token should be revoked after logout');
  } catch (error: any) {
    assert.strictEqual(error.statusCode, 401);
    console.log('     ✔ Token successfully revoked on logout.');
  }

  // Test 7: Forgot Password token generation
  console.log('  7. Testing Forgot Password...');
  await authService.forgotPassword('test@ems.com');
  const user = mockDb.get('test@ems.com')!;
  assert.ok(user.resetPasswordToken);
  assert.ok(user.resetPasswordExpires);
  console.log('     ✔ Password reset token stored securely.');

  // Test 8: Reset Password
  console.log('  8. Testing Reset Password...');
  // Force a static token validation by updating DB resetPasswordToken manually
  const testPlainToken = 'my-temporary-secret-token-1234';
  const testHashedToken = hashToken(testPlainToken);
  const testExpiry = new Date(Date.now() + 600000); // 10 mins
  await userRepository.updateUser(user.id, {
    resetPasswordToken: testHashedToken,
    resetPasswordExpires: testExpiry
  });
  
  await authService.resetPassword(testPlainToken, 'NextSecurePassword123!');
  const resetUser = mockDb.get('test@ems.com')!;
  assert.strictEqual(resetUser.resetPasswordToken, null);
  assert.strictEqual(resetUser.resetPasswordExpires, null);
  
  // Verify login with new password
  const nextLoginResult = await authService.login({
    email: 'test@ems.com',
    password: 'NextSecurePassword123!'
  });
  assert.ok(nextLoginResult.accessToken);
  console.log('     ✔ Password reset and login rotation verified.');

  console.log('\n⭐ All unit verification assertions passed successfully!');
};

runTests().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
