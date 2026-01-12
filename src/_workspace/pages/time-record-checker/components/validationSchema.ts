import { z } from 'zod'

export const rejectFormSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
})

export type RejectFormData = z.infer<typeof rejectFormSchema>
