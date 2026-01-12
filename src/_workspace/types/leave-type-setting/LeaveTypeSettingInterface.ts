export interface LeaveTypeData {
  LEAVE_TYPE_ID: number
  LEAVE_TYPE_CODE: string
  LEAVE_TYPE_DESCRIPTION_TH: string
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_MAX_DAY: number
  LEAVE_TYPE_IS_REQUIRE_FILE: boolean
  LEAVE_TYPE_IS_ACTIVE: boolean
  LEAVE_TYPE_SORT_ORDER?: number
  CREATE_DATE?: string
  UPDATE_DATE?: string
  CREATE_BY?: string
  UPDATE_BY?: string
  [key: string]: any
}
export interface LeaveTypeSearchParams {
  LEAVE_TYPE_CODE?: string
  LEAVE_TYPE_DESCRIPTION?: string
  STATUS?: object | string | null
  Start?: string
  Limit?: string
  Order?: any
}
export interface LeaveTypeCreatePayload {
  LEAVE_TYPE_CODE: string
  LEAVE_TYPE_DESCRIPTION_TH: string
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_MAX_DAY: number
  LEAVE_TYPE_IS_REQUIRE_FILE: boolean
  LEAVE_TYPE_IS_ACTIVE: boolean
  LEAVE_TYPE_SORT_ORDER?: number
}
export interface LeaveTypeResponse {
  Status: boolean
  Message: string
  MessageWarning?: string
  MethodOnDb?: string
  ResultOnDb?: LeaveTypeData[]
  TotalCountOnDb?: number
}
export const LEAVE_TYPE_STATUS_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด / All' },
  { value: 'active', label: 'ใช้งาน / Active' },
  { value: 'inactive', label: 'ไม่ใช้งาน / Inactive' }
]
