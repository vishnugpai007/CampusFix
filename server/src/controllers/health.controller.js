import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as healthService from '../services/health.service.js';

export const checkHealth = asyncHandler(async (req, res) => {
  const status = healthService.getHealthStatus();
  return res.status(200).json(new ApiResponse(200, status, 'System health retrieved successfully'));
});
