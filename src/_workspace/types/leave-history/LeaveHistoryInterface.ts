export interface LeaveApprover {
  APPROVER_ID?: number
  APPROVER_NAME?: string
  APPROVER_POSITION?: string
  APPROVER_STATUS?: string
  APPROVER_DATE?: string
  APPROVER_REMARK?: string
}
export interface LeaveHistoryInterface {
  LEAVE_REQUEST_ID?: string | number
  EMPLOYEE_ID?: string
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  PCODE?: string
  LEAVE_TYPE_ID?: number
  LEAVE_TYPE_CODE?: string
  LEAVE_TYPE_DESCRIPTION_EN?: string
  LEAVE_TYPE_DESCRIPTION_TH?: string
  LEAVE_REQUEST_START_DATE?: string
  LEAVE_REQUEST_END_DATE?: string
  LEAVE_DATE_RANGE?: string
  LEAVE_REQUEST_TIME?: string
  LEAVE_REQUEST_TOTAL_DAY?: number | string
  LEAVE_REQUEST_REASON?: string
  LEAVE_REQUEST_REMARK?: string
  LEAVE_REQUEST_FILE_UPLOAD_ID?: string | number
  LEAVE_REQUEST_FILE_UPLOAD_PATH?: string
  LEAVE_REQUEST_FILE_UPLOAD_NAME?: string
  LEAVE_REQUEST_FILE_NAME?: string
  LEAVE_REQUEST_STATUS?: string
  IS_APPROVED?: number | string
  IS_APPROVER_APPROVED?: string
  APPROVER?: LeaveApprover[]
  INUSE?: number | string
  CREATE_DATE?: string
  CREATE_BY?: string
  UPDATE_DATE?: string
  UPDATE_BY?: string
}
export interface LeaveHistorySearchParams {
  LEAVE_REQUEST_DATE?: string
  LEAVE_TYPE_CODE?: string
  INUSE?: string
  EMPLOYEE_CODE?: string
  Start?: string
  Limit?: string
  Order?: Array<{ id: string; desc: boolean }>
}
