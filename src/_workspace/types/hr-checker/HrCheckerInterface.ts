export interface HrCheckerSearchParams {
  EMPLOYEE_CODE?: string
  LEAVE_TYPE?: any
  START_DATE?: string
  END_DATE?: string
  STATUS?: string
  STATUS_FOR_APPROVE?: string
  START?: string
  LIMIT?: string
  ORDER?: any
}
export interface HrCheckerResponseData {
  LEAVE_REQUEST_ID: number
  LEAVE_REQUEST_EMPLOYEE_CODE: string
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_FULL_NAME: string
  EMPLOYEE_SECTION: string
  LEAVE_TYPE_DESCRIPTION_TH: string
  LEAVE_REQUEST_TIME: string
  LEAVE_REQUEST_TOTAL_DAY: number
  LEAVE_REQUEST_START_DATE: string
  LEAVE_REQUEST_END_DATE: string
  LEAVE_DATE_RANGE: string
  LEAVE_REQUEST_REASON: string
  LEAVE_REQUEST_REMARK: string
  TYPE: string
  LEAVE_REQUEST_STATUS: number
  IS_APPROVED: number
  IS_APPROVER_APPROVED: number
  CHECKED: string | number | null
  approveNo1: string
  approveNo2: string
  approveNo3: string
  approveNo4: string
  approveNo5: string
  APPROVER: string[]
  LEAVE_REQUEST_FILE_UPLOAD_NAME: string | null
  LEAVE_REQUEST_FILE_UPLOAD_PATH: string | null
  CREATE_DATE: string
  REAL_CREATE_DATE: string
  UPDATE_DATE: string
  CREATE_BY: string
  UPDATE_BY: string
  IN_TIME: string | null
  OUT_TIME: string | null
  [key: string]: any
}
export interface HrCheckerUpdatePayload {
  LEAVE_REQUEST_ID?: string
  HR_CHECK_STATUS?: string
  HR_CHECK_REMARK?: string
  HR_CHECKER_CODE?: string
  isSelectAllActive?: boolean
  rowAction?: { LEAVE_REQUEST_ID: string; TYPE: string }[]
  approvalBy?: string
  totalCount?: number
  requestLeaveIdAll?: number[]
}
export interface HrCheckStatusOption {
  value: string
  label: string
}
export const HR_CHECK_STATUS_OPTIONS: HrCheckStatusOption[] = [
  { value: '0', label: 'ยังไม่ตรวจสอบ / Not-check' },
  { value: '1', label: 'ตรวจสอบแล้ว / Checked' },
  { value: 'all', label: 'ทั้งหมด / All' }
]
export const HR_CHECK_STATUS_OPTIONS_FOR_LEAVE: HrCheckStatusOption[] = [
  { value: 'notCheck', label: 'ยังไม่ตรวจสอบ / Not-check' },
  { value: 'checked', label: 'ตรวจสอบแล้ว / Checked' },
  { value: 'all', label: 'ทั้งหมด / All' }
]
export const APPROVE_STATUS_OPTIONS: HrCheckStatusOption[] = [
  { value: '1', label: 'อนุมัติแล้ว / Approved' },
  { value: '0', label: 'ไม่อนุมัติ / Rejected' }
]
