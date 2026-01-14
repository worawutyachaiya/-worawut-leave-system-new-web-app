import Time from 'react-datepicker/dist/time'
export interface TimeRecordTypeI {
  TIME_RECORD_TYPE_ID: number
  TIME_RECORD_TYPE_DESCRIPTION: string
}
export interface TimeRecordRequestCreatePayload {
  TIMEIN: string
  TIMEOUT: string
  DATEIN: string
  DATEOUT: string
  TYPE: number | undefined
  REASON?: string
  EMPLOYEE_CODE: string
}
export interface TimeRecordApprovalResponse {
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_SECTION: string
  CREATE_DATE: string
  TIME_RECORD_REQUEST_ID: string
  TIME_RECORD_REASON: string
  TIME_RECORD_TYPE_DESCRIPTION: string
  IN_TIME: string
  OUT_TIME: string
  UPDATE_DATE: string
  IS_APPROVED: number
  EMPLOYEE_ID: string
  UPDATE_BY: string
  INUSE: number
  approveNo1: string
  approveNo2: string
  approveNo3: string
  approveNo4: string
  approveNo5: string
  APPROVAL_STATUS_ID: number | null
  EMPLOYEE_FULL_NAME: string
  APPROVER: string[]
  TIME_RECORD_REQUEST_STATUS: number
  [key: string]: any
}
export interface TimeRecordResponseData {
  TIME_RECORD_REQUEST_ID?: string
  TIME_RECORD_TYPE_ID?: number
  TIME_RECORD_TYPE_DESCRIPTION?: string
  TIME_RECORD_REASON?: string
  TIME_RECORD_REQUEST_STATUS?: string
  TIME_IN?: string
  TIME_OUT?: string
  DATE_IN?: string
  DATE_OUT?: string
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
  [key: string]: any
}
export interface TimeRecordResponse {
  Status: boolean
  Message: string
  MessageWarning?: string
  MethodOnDb?: string
  ResultOnDb?: TimeRecordResponseData[]
  TotalCountOnDb?: number
}
export interface LeaveApprover {
  APPROVER_ID?: number
  APPROVER_NAME?: string
  APPROVER_POSITION?: string
  APPROVER_STATUS?: string
  APPROVER_DATE?: string
  APPROVER_REMARK?: string
}
export interface DeleteTimeRecordParams {
  TIME_RECORD_REQUEST_ID: string | number
  EMPLOYEE_CODE: string
}
export interface TimeRecordHistoryInterface {
  TIME_RECORD_REQUEST_ID: string
  TIME_RECORD_TYPE_DESCRIPTION: string
  IN_TIME: string
  OUT_TIME: string
  CREATE_DATE: string
  UPDATE_DATE: string
  IS_APPROVED: number
  REMARK: string
  UPDATE_BY: string
  INUSE: number | string
  IS_APPROVER_APPROVED: number
  PCODE: string
  approveNo1: string
  approveNo2: string
  approveNo3: string
  approveNo4: string
  approveNo5: string
  LEAVE_REQUEST_STATUS: number
  TOTAL_COUNT?: number
  APPROVER?: LeaveApprover[]
}
export interface TimeRecordSearchParams {
  REQUEST_DATE?: string
  EMPLOYEE_CODE?: string
  Start: number
  Limit: number
  Order: object[] | undefined
}
export interface TimeRecordHRCheckerSearchParams {
  EMPLOYEE_CODE?: string
  EMPLOYEE_DEPT?: string
  LEAVE_TYPE?: number[]
  START_DATE?: string
  END_DATE?: string
  STATUS?: string
  STATUS_FOR_APPROVE?: string
  Start?: number
  Limit?: number
  Order?: any
}
export interface TimeRecordApprovalPayload {
  TIME_RECORD_REQUEST_ID: string
  status: string
  approverCode: string
  remark?: string
}
