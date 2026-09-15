import rateLimit from 'express-rate-limit';

/**
 * Dedicated Rate Limiter for expensive file upload endpoints to prevent buffer DoS & Cloudinary bandwidth exhaustion.
 * Limits each IP to 10 issue creation requests per 15 minutes.
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 upload requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many issue creation attempts from this IP. Please try again after 15 minutes.'
  }
});
