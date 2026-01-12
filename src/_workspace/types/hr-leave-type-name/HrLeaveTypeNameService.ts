export interface SearchLeaveTypeParams {
  LEAVE_TYPE_CODE?: string
  LEAVE_TYPE_DESCRIPTION_EN?: string
  INUSE?: string
  Start?: string
  Limit?: string
  Order?: Array<{ id: string; desc: boolean }>
}
export interface UpdateLeaveTypeParams {
  LEAVE_TYPE_ID: number
  LEAVE_TYPE_CODE: string
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_DESCRIPTION_TH?: string
  LEAVE_TYPE_MAX_DAY?: number
  LEAVE_TYPE_REQUEST_DAY_BEFORE_USE?: number
  INUSE?: string
  UPDATE_BY: string
}
export interface DeleteLeaveTypeParams {
  LEAVE_TYPE_ID: number
  UPDATE_BY: string
}
