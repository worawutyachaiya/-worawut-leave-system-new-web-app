import { z } from 'zod'
export const validationSchemaModal = z.object({
  LEAVE_TYPE_CODE: z.string().min(1, 'Leave Type Code is required'),
  LEAVE_TYPE_NAME: z.string().min(1, 'Leave Type Name is required'),
  DESCRIPTION: z.string().min(1, 'Description is required'),
  LEAVE_DAY_AS_DESCRIPTION: z.number().min(0, 'Leave Day must be at least 0'),
  LEAVE_TYPE_REQUEST_BEFORE_USE: z.number().min(0, 'Request before use must be at least 0'),
  STATUS: z.string().min(1, 'Status is required')
})
export type FormDataModal = z.infer<typeof validationSchemaModal>
export interface LeaveTypeData {
  LEAVE_TYPE_ID?: number
  LEAVE_TYPE_CODE: string
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_REQUEST_DAY_BEFORE_USE: number
  INUSE: number
  MODIFIED_DATE?: string
  UPDATE_BY?: string
  DESCRIPTION?: string
  LEAVE_DAY_AS_DESCRIPTION?: number
}
export const statusOptions = [
  { value: 'Use', label: 'Use' },
  { value: 'Cancel', label: 'Cancel' }
]
