export interface LeaveTypeRegulationInterface {
  LEAVE_TYPE_REGULATION_ID: number
  LEAVE_TYPE_ID: number
  DEPARTMENT_ID: number
  LEAVE_TYPE_CODE?: string
  LEAVE_TYPE_DESCRIPTION_EN?: string
  LEAVE_TYPE_DESCRIPTION_TH?: string
  DEPARTMENT?: string
  LEAVE_TYPE_REQUEST_DAY_BEFORE_USE?: number
  LEAVE_TYPE_MAX_DAY?: number
  INUSE?: string | number
  CREATE_BY?: string
  CREATE_DATE?: string
  UPDATE_BY?: string
  MODIFIED?: string
  MODIFIED_DATE?: string
}
