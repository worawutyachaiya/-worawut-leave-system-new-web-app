export interface LeaveRequestCreatePayload {
  LEAVE_TYPE: number
  START_DATE: string
  END_DATE: string
  LEAVE_TIME: string
  TOTAL_DAY_LEAVE: string
  REASON: string
  REMARK: string
  EMPLOYEE_CODE: string
  EMPLOYEE_POSITION: string
  EMPLOYEE_DEPARTMENT: string
  LEAVE_REQUEST_EMPLOYEE_TELEPHONE?: string
  IS_EMPLOYEE_FORM: boolean
  FILE_UPLOAD?: File | null
}
export interface LeaveRequestResponseData {
  LEAVE_REQUEST_ID?: number | string
  [key: string]: any
}
