export interface SearchUserLeaveParams {
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_SECTION?: string
  Start?: string
  Limit?: string
  Order?: Array<{ id: string; desc: boolean }>
}
export interface UpdateUserLeaveParams {
  EMPLOYEE_ID?: string
  LEAVE_REQUEST_ID?: number | string
  OLD_LEAVE_TYPE_ID?: number | string
  NEW_LEAVE_TYPE_ID?: number | string
  OLD_START_DATE?: string
  NEW_START_DATE?: string
  OLD_END_DATE?: string
  NEW_END_DATE?: string
  OLD_TIME?: string
  NEW_TIME?: string
  OLD_TOTAL_DAY?: number | string
  NEW_TOTAL_DAY?: number | string
  OLD_REASON?: string
  NEW_REASON?: string
  IS_DELETE_DOC?: boolean
  UPDATE_BY?: string
}
export interface DeleteUserLeaveParams {
  LEAVE_REQUEST_ID?: number | string
  LEAVE_TYPE_ID?: number | string
  LEAVE_REQUEST_TOTAL_DAY?: number | string
  EMPLOYEE_CODE?: string
  EMPLOYEE_ID?: string
  UPDATE_BY: string
}
