import { z } from 'zod'
export const validationSchemaModal = z.object({
  LEAVE_TYPE: z.string().min(1, 'Leave Type is required'),
  DEPARTMENT: z.string().min(1, 'Department is required'),
  NUMBER_DAY: z.number().min(0, 'Number of Day must be at least 0'),
  INUSE: z.string().optional()
})
export type FormDataModal = z.infer<typeof validationSchemaModal>
export interface LeaveTypeRegulationData {
  LEAVE_TYPE_REGULATION_ID?: number
  LEAVE_TYPE_ID?: number
  LEAVE_TYPE_CODE: string
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_DESCRIPTION_TH?: string
  DEPARTMENT_ID?: number
  DEPARTMENT: string
  LEAVE_TYPE_REQUEST_DAY_BEFORE_USE: number
  INUSE: number
  MODIFIED_DATE?: string
  UPDATE_BY?: string
}
