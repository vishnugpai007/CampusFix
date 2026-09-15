import { z } from 'zod';

const CATEGORIES = ['wifi', 'electricity', 'water', 'mess', 'furniture', 'cleanliness', 'security', 'other'];
const STATUSES = ['open', 'in_progress', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high'];

export const createIssueSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
  location: z.string({ required_error: 'Location is required' }).trim().min(2, 'Location is required'),
  priority: z.enum(PRIORITIES).optional().default('medium')
});

export const updateIssueSchema = createIssueSchema.partial();

export const issueQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(STATUSES).optional(),
  category: z.enum(CATEGORIES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  search: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'most_upvoted']).default('newest'),
  mine: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true')
});

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES, { errorMap: () => ({ message: 'Invalid status' }) }),
  resolutionNote: z.string().trim().optional()
});

export const assignIssueSchema = z.object({
  assignedTo: z
    .string({ required_error: 'Staff user ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
});
