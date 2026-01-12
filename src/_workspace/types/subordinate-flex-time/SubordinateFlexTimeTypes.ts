export type ViewType = 'calendar' | 'table'

export interface FilterOption {
  value: string
  label: string
  color: string
  checked: boolean
}

export interface EmployeeOptionType {
  EMPLOYEE_ID: string
  EMPLOYEE_NAME: string
}

export interface EmployeeInfoType {
  EMPLOYEE_ID: string
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_DEPT: string
  EMPLOYEE_SECTION: string
}

export interface FlexTimeCalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay?: boolean
  extendedProps?: {
    flexTimeTypeId?: number
    flexTimeCode?: string
    status?: string
    isHoliday?: boolean
    holidayType?: string
    [key: string]: any
  }
}

export interface SubordinateFlexTime {
  // ข้อมูลพนักงาน
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_SECTION: string
  EMPLOYEE_FULL_NAME?: string
  FLEX_TIME_REQUEST_EMPLOYEE_CODE: string

  FLEX_TIME_REQUEST_ID: number
  FLEX_TIME_REQUEST_START_DATE: string
  FLEX_TIME_REQUEST_END_DATE: string
  FLEX_TIME_DESCRIPTION: string
  DESCRIPTION: string

  CREATE_DATE: string
  UPDATE_DATE: string
  UPDATE_BY: string
  IS_APPROVED: number
  FLEX_TIME_REQUEST_STATUS: number

  approveNo1?: string
  approveNo2?: string
  approveNo3?: string
  approveNo4?: string
  approveNo5?: string
  APPROVER?: string[]

  LEAVE_DATE_RANGE?: string

  [key: string]: any
}
