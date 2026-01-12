import { z } from 'zod'
export const editUserLeaveSchema = z.object({
  leaveType: z.union([
    z.object({
      value: z.union([z.string(), z.number()]),
      label: z.string()
    }),
    z.undefined(),
    z.null()
  ]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  time: z.union([
    z.object({
      value: z.string(),
      label: z.string()
    }),
    z.undefined(),
    z.null()
  ]).optional(),
  totalLeaveDay: z.union([z.string(), z.number()]).optional(),
  cancelAttachment: z.enum(['yes', 'no']).optional().default('no'),
  reason: z.string().optional()
})
export type EditUserLeaveFormData = z.infer<typeof editUserLeaveSchema>
