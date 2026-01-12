import { z } from 'zod'
export const leaveFileUploadSchema = z.object({
    fileUpload: z.any().nullable().optional(),
    reason: z.string().nullable().optional(),
    remark: z.string().nullable().optional()
})
export type LeaveFileUploadFormData = z.infer<typeof leaveFileUploadSchema>
