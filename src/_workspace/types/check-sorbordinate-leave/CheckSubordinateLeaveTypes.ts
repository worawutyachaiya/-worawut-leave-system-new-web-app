export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay?: boolean
  extendedProps?: {
    leaveType?: string
    employeeCode?: string
    employeeName?: string
    status?: string
    isHoliday?: boolean
    holidayType?: string
    [key: string]: any
  }
}
export interface FilterOption {
  value: string
  label: string
  color: string
  checked: boolean
}
export interface EmployeeInfoType {
  EMPLOYEE_ID: string
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_DEPT: string
  EMPLOYEE_SECTION: string
}
export interface EmployeeOptionType extends EmployeeInfoType {
  value: string
  label: string
}
export interface LeaveRecord {
  LEAVE_REQUEST_ID: string | number
  EMPLOYEE_CODE: string
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_SECTION: string
  LEAVE_TYPE_DESCRIPTION_TH: string
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_REQUEST_START_DATE: string
  LEAVE_REQUEST_END_DATE: string
  LEAVE_REQUEST_TOTAL_DAY: number
  LEAVE_REQUEST_TIME?: string
  LEAVE_REQUEST_REASON?: string
  LEAVE_REQUEST_REMARK?: string
  LEAVE_REQUEST_FILE_UPLOAD_PATH: string | null
  LEAVE_REQUEST_FILE_UPLOAD_NAME: string | null
  LEAVE_REQUEST_STATUS?: number | string
  IS_APPROVED?: number | string
  approveNo1?: string
  approveNo2?: string
  approveNo3?: string
  approveNo4?: string
  approveNo5?: string
  CREATE_DATE: string
  UPDATE_DATE: string
  UPDATE_BY: string
  [key: string]: any
}
export interface CheckSubordinateLeaveSearchParams {
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_SECTION?: string
  Start?: string
  Limit?: string
  Order?: any
}
export type ViewType = 'calendar' | 'table'
