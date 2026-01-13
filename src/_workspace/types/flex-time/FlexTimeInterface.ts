export interface FlexTimeType {
  FLEX_TIME_TYPE_ID: number
  FLEX_TIME_DESCRIPTION: string
  DESCRIPTION?: string
  CREATE_BY?: string
  UPDATE_BY?: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
  INUSE?: number
}
export interface FlexTimeRequestData {
  FLEX_TIME_REQUEST_ID: string
  FLEX_TIME_REQUEST_EMPLOYEE_ID?: string
  EMPLOYEE_CODE: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_SURNAME?: string
  EMPLOYEE_SECTION?: string
  SECT_NAME?: string
  FLEX_TIME_TYPE_ID: number
  FLEX_TIME_CODE?: string
  FLEX_TIME_DESCRIPTION?: string
  FLEX_TIME_START?: string
  FLEX_TIME_END?: string
  FLEX_TIME_REQUEST_START_DATE?: string
  FLEX_TIME_REQUEST_END_DATE?: string
  REQUEST_DATE: string
  START_DATE: string
  END_DATE: string
  DESCRIPTION?: string
  REASON?: string
  STATUS: string
  FLEX_TIME_REQUEST_STATUS?: string
  IS_APPROVED?: number
  IS_APPROVER_APPROVED?: number
  STATUS_FOR_APPROVE?: string
  APPROVER_CODE?: string
  APPROVER_NAME?: string
  APPROVED_DATE?: string
  HR_CHECK_STATUS?: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
  CREATE_BY?: string
  UPDATE_BY?: string
  INUSE?: number
  approveNo1?: string
  approveNo2?: string
  approveNo3?: string
  approveNo4?: string
  approveNo5?: string
  APPROVER?: string[]
  APPROVED_BY_LIST?: string[]
  [key: string]: any
}
export interface UserFlexTimeData {
  FLEX_TIME_REQUEST_ID: number
  FLEX_TIME_REQUEST_EMPLOYEE_CODE: string
  EMPLOYEE_ID: string

  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_SECTION: string
  EMPLOYEE_FULL_NAME?: string

  FLEX_TIME_TYPE_ID: number
  FLEX_TIME_DESCRIPTION: string
  FLEX_TIME_REQUEST_START_DATE: string
  FLEX_TIME_REQUEST_END_DATE: string
  FLEX_TIME_REQUEST_TOTAL_DAY: number
  DESCRIPTION: string

  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  INUSE: number
  IS_APPROVED: number

  LEAVE_DATE_RANGE?: string
  LEAVE_TYPE?: string

  approveNo1?: string
  approveNo2?: string
  approveNo3?: string
  approveNo4?: string
  approveNo5?: string
  APPROVER?: string[]
  FLEX_TIME_REQUEST_STATUS?: number
  APPROVED_BY_LIST?: string[]
}
export interface FlexTimeSearchParams {
  EMPLOYEE_CODE?: string
  START_DATE?: string
  END_DATE?: string
  FLEX_TIME_TYPE?: number[]
  STATUS?: string
  STATUS_FOR_APPROVE?: string
  Start?: string
  Limit?: string
  Order?: any
}
export interface FlexTimeHistorySearchParams {
  EMPLOYEE_CODE?: string
  FLEX_TIME_REQUEST_DATE?: string
  FLEX_TIME_TYPE_ID?: string
  START_DATE?: string
  END_DATE?: string
  Start?: string
  Limit?: string
  Order?: any
}
export interface FlexTimeApprovalSearchParams {
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_SECTION?: string
  EMPLOYEE_CODE_REQUEST?: string
  DEPT_FLOW?: string[]
  Start?: string
  Limit?: string
  Order?: any
}
export interface FlexTimeCreatePayload {
  EMPLOYEE_CODE: string
  FLEX_TIME_ID: number
  START_DATE: string
  END_DATE: string
  REASON?: string
}
export interface FlexTimeUpdatePayload {
  FLEX_TIME_REQUEST_ID: string
  STATUS?: string
  STATUS_FOR_APPROVE?: string
  APPROVER_REMARK?: string
}
export interface FlexTimeApprovalPayload {
  rowAction: Array<{
    FLEX_TIME_REQUEST_ID: number
    EMPLOYEE_CODE?: string
  }>
  approvalBy: string
  approvalStatus: number
  remark?: string
}
export interface FlexTimeHrCheckerUpdatePayload {
  FLEX_TIME_REQUEST_ID: string
  HR_CHECK_STATUS: string
  HR_CHECK_REMARK?: string
  HR_CHECKER_CODE: string
}

export interface UserFlexTimeUpdatePayload {
  FLEX_TIME_REQUEST_ID: number
  FLEX_TIME_TYPE_ID: number
  FLEX_TIME_REQUEST_START_DATE: string
  FLEX_TIME_REQUEST_END_DATE: string
  FLEX_TIME_REQUEST_TOTAL_DAY: number
  DESCRIPTION?: string
  UPDATE_BY: string
}

export interface UserFlexTimeDeletePayload {
  FLEX_TIME_REQUEST_ID: number
  EMPLOYEE_CODE: string
}

export interface FlexTimeResponse {
  FLEX_TIME_DESCRIPTION: string
  Status: boolean
  Message: string
  MessageWarning?: string
  MethodOnDb?: string
  ResultOnDb?: any
  TotalCountOnDb?: number
}
export interface FlexTimeCalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay?: boolean
  extendedProps?: {
    flexTimeId?: number
    flexTimeCode?: string
    status?: string
    [key: string]: any
  }
}
export const FLEX_TIME_STATUS_OPTIONS = [
  { value: 'pending', label: 'รอการอนุมัติ / Pending' },
  { value: 'approved', label: 'อนุมัติแล้ว / Approved' },
  { value: 'rejected', label: 'ไม่อนุมัติ / Rejected' },
  { value: 'cancelled', label: 'ยกเลิก / Cancelled' }
]
export const FLEX_TIME_TYPE_OPTIONS = [
  { value: '1', label: '07:30 - 16:30', code: '07.30-16.30' },
  { value: '2', label: '08:30 - 17:30', code: '08.30-17.30' },
  { value: '3', label: '09:30 - 18:30', code: '09.30-18.30' }
]
export const FLEX_TIME_CALENDAR_COLORS: Record<string, string> = {
  '07.30-16.30': 'primary',
  '08.30-17.30': 'success',
  '09.30-18.30': 'info',
  'Company Holiday': 'danger',
  'Substitution Holiday': 'danger',
  'Traditional Holiday': 'danger'
}

export interface FlexTimeEmployeeDateParams {
  employeeId: string
  startDate: string
  endDate: string
}

export interface FlexTimeSpecificDateParams {
  EMPLOYEE_CODE?: string
  START_DATE?: string
  END_DATE?: string
  SPECIFIC_DATE?: string
}

export interface FlexTimeUserParams {
  EMPLOYEE_CODE?: string
  INUSE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_DEPT?: any
  Start?: string
  Limit?: string
}

export interface SubordinateFlexTimeSearchParams {
  FLEX_TIME_REQUEST_DATE?: string
  FLEX_TIME_TYPE_ID?: string
  START_DATE: string
  END_DATE: string
  EMPLOYEE_ID_REQUEST: string
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_SECTION?: string
  Start?: string
  Limit?: string
}

export interface SubordinateFlexTimeCalendarParams {
  EMPLOYEE_CODE: string
  START_DATE: string
  END_DATE: string
  EMPLOYEE_ID_REQUEST: string
}
