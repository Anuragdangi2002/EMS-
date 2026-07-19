import { z } from 'zod';

export const idParamsSchema = z.object({ id: z.string().uuid('Invalid resource ID') });
