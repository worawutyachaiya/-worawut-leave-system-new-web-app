import { z } from 'zod'
export const rejectRemarkSchema = z.object({
    remark: z.string().nullable().optional()
})
export type RejectRemarkFormData = z.infer<typeof rejectRemarkSchema>
