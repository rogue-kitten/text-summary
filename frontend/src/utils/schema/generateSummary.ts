import { z } from 'zod';

export const generateSummarySchema = z.object({
  text: z.string().min(1, 'Text is required'),
  number: z.coerce
    .number()
    .int()
    .positive('Number must be positive')
    .max(20, 'Number must be less than or equal to 20'),
});

export type GenerateSummaryType = z.infer<typeof generateSummarySchema>;
