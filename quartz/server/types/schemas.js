import { z } from "zod";

// Environmental Report Schema
export const EnvironmentalReportSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  country: z.string().min(1),
  sector: z.string().min(1),
  url: z.string().url(),
  human_eval: z.number().int().min(0).max(100),
  accepted: z.boolean(),
  confidence: z.number().min(0).max(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Review Update Schema
export const ReviewUpdateSchema = z.object({
  score: z.number().int().min(0).max(100),
  accepted: z.boolean(),
});

// Query Parameters Schema
export const ReportsQuerySchema = z.object({
  country: z.string().optional(),
  sector: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .pipe(z.number().int().min(1))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  sortBy: z.enum(["name", "country", "human_eval", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// API Response Schemas
export const ReportsResponseSchema = z.object({
  data: z.array(EnvironmentalReportSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
  aggregates: z.object({
    averageScore: z.number(),
    acceptedCount: z.number().int(),
    totalCount: z.number().int(),
  }),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

// Type exports for TypeScript (if needed later)
export const EnvironmentalReportType = EnvironmentalReportSchema._type;
export const ReviewUpdateType = ReviewUpdateSchema._type;
export const ReportsQueryType = ReportsQuerySchema._type;
