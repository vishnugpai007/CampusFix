import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import issueRouter from './routes/issue.routes.js';

const app = express();

// 1. Security Headers: Helmet must run first so all responses include security headers.
app.use(helmet());

// 2. CORS: Must process before body parsing to handle preflight (OPTIONS) requests & block unauthorized origins early.
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);

// 3. Body Parsers: Must run before routes so req.body is populated, with payload size limits to block payload DoS.
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// 4. Cookie Parser: Runs before routes so authentication cookies are accessible via req.cookies.
app.use(cookieParser());

// 5. Global Rate Limiter: Placed after body/cookie setup but before routes to protect endpoints from abuse/DoS.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

app.use('/api', globalLimiter);

// 6. Application Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/issues', issueRouter);

// 7. 404 Not Found: Placed after all valid route definitions to catch unmatched endpoints.
app.use(notFound);

// 8. Global Error Handler: Placed strictly last so any error passed to next(err) lands here.
app.use(errorHandler);

export default app;
