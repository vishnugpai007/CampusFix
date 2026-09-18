import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const registerUser = async ({ name, email, password, hostelBlock, role = 'student' }) => {
  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Ensure role is one of valid enum values
  const validRole = ['student', 'staff', 'host'].includes(role) ? role : 'student';

  const user = new User({
    name,
    email,
    password,
    hostelBlock,
    role: validRole
  });

  await user.save();

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ email, password, role }) => {
  // Select password explicitly since it has select: false in schema
  const user = await User.findOne({ email }).select('+password');

  // Generic failure message for both non-existent user and wrong password to prevent user enumeration attacks
  const GENERIC_AUTH_ERROR = 'Invalid email or password';

  if (!user) {
    throw new ApiError(401, GENERIC_AUTH_ERROR);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, GENERIC_AUTH_ERROR);
  }

  // Check portal role match if specified
  if (role && user.role !== role) {
    const roleCapitalized = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    throw new ApiError(403, `Role mismatch: This account is registered as ${user.role === 'host' ? 'a Host' : 'a ' + roleCapitalized}. Please log in via the ${roleCapitalized} portal.`);
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

export const refreshTokens = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Token rotation: Issue fresh access token AND fresh refresh token
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, newRefreshToken };
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};
