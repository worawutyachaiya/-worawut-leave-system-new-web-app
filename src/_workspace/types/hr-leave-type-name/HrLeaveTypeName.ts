export interface LeaveTypeInterface {
  LEAVE_TYPE_ID: number
  LEAVE_TYPE_CODE: string
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_DESCRIPTION_TH?: string
  LEAVE_TYPE_MAX_DAY?: number
  LEAVE_TYPE_REQUEST_DAY_BEFORE_USE?: number
  INUSE?: string | number
  CREATE_BY?: string
  CREATE_DATE?: string
  UPDATE_BY?: string
  MODIFIED?: string
  MODIFIED_DATE?: string
}
