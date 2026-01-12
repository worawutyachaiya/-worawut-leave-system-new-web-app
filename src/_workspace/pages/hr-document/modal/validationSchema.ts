import { z } from 'zod'
export const validationSchemaModal = z.object({
  LEAVE_TYPE: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Leave type is required'
  }),
  DESCRIPTION: z.string().optional(),
  FILE: z.any().optional()
})
export type FormDataModal = z.infer<typeof validationSchemaModal>
export interface DocumentData {
  LEAVE_REGULARITY_ID?: number
  LEAVE_REGULARITY_NAME?: string
  LEAVE_REGULARITY_FILE_NAME?: string
  DESCRIPTION?: string
  INUSE?: string | number
  UPDATE_BY?: string
  MODIFIED?: string
}
