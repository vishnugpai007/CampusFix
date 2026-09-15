import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { env } from '../config/env.js';
import * as authService from '../services/auth.service.js';

// Cross-site cookie configuration for production deployment (e.g. Render backend + Vercel frontend)
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  return res
    .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .status(201)
    .json(new ApiResponse(201, { user, accessToken }, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  return res
    .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, { user, accessToken }, 'Logged in successfully'));
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  const { user, accessToken, newRefreshToken } = await authService.refreshTokens(incomingRefreshToken);

  return res
    .cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, { user, accessToken }, 'Access token refreshed successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await authService.logoutUser(req.user._id);
  }

  return res
    .clearCookie('refreshToken', COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, {}, 'Logged out successfully'));
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  return res.status(200).json(new ApiResponse(200, user, 'Current user retrieved successfully'));
});
