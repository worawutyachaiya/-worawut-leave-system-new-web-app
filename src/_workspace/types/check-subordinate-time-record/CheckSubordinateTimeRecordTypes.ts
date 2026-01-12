export type ViewType = 'calendar' | 'table'

export interface CheckSubordinateTimeRecord {
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
