export interface EmployeeLeaveM75SearchI {
  employeeCode?: string
  employeeName?: string
  department?: string
  section?: string
  leaveType?: string
  startDate?: string
  endDate?: string
  timeLeave?: string
  total?: string
  Start?: string
  Limit?: string
  Order?: any
}
export interface EmployeeLeaveM75ResponseDataI {
  EMPLOYEE_CODE: string
  EMPLOYEE_NAME: string
  DEPARTMENT_NAME?: string
  SECTION_NAME: string
  LEAVE_TYPE_ID?: number
  LEAVE_TYPE_DESCRIPTION_TH: string
  LEAVE_TYPE_DESCRIPTION_EN?: string
  LEAVE_START_DATE?: string
  LEAVE_END_DATE?: string
  LEAVE_TIME: string
  TOTAL_DAY_LEAVE: number
  REASON: string
  REMARK?: string
  CREATE_DATE?: string
  UPDATE_DATE: string
  UPDATE_BY?: string
  STATUS?: string
  APPROVAL?: string
  LEAVE_ATTACHMENT?: string
  REQUEST_LEAVE_DATE?: string
  LEAVE_DATE?: string
  [key: string]: any
}
export interface EmployeeLeaveM75ResponseI {
  Status: boolean
  Message: string
  MessageWarning?: string
  MethodOnDb?: string
  ResultOnDb?: EmployeeLeaveM75ResponseDataI[]
  TotalCountOnDb?: number
}
