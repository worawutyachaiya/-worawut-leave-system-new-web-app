export interface LeaveEmployeeInformationInterface {
  EMPLOYEE_CODE?: string
  EMPLOYEE_ID: number
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_SEX: string
  EMPLOYEE_EMAIL: string
  EMPLOYEE_POSITION_CODE: string
  EMPLOYEE_POSITION: string
  EMPLOYEE_SECTION: string
  EMPLOYEE_DEPT_FLOW: string
  EMPLOYEE_START_WORK: string
  EMPLOYEE_BIRTH_DAY: string
  EMPLOYEE_EXP: string
  EMPLOYEE_DEPT: string
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  DESCRIPTION: string
  INUSE: string
}
export interface SectionInterface {
  SECT_NAME: string | null
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  DESCRIPTION: string
  INUSE: string
}
export interface LeaveAlRemainSearchParams {
  EMPLOYEE_SECTION?: string
  EMPLOYEE_NAME?: string
  INUSE?: number | string
  EMPLOYEE_CODE?: string
  EMPLOYEE_ID_REQUEST?: string
  Start?: number
  Limit?: number
  Order?: Array<{ id: string; desc: boolean }>
}
export interface LeaveAlRemainInterface {
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_SURNAME?: string
  EMPLOYEE_SECTION?: string
  EMPLOYEE_START_WORK?: string
  empCode_resign?: string | null
  LEAVE_TYPE_ID?: number
  LEAVE_REMAIN_DAY?: string | number
  LEAVE_REMAIN_DAY_CONCAT?: string | number
  LEAVE_TYPE_ID_CONCAT?: string | number
  EMPLOYEE_FULL_NAME?: string
  REMAIN_AL: string | number
  REMAIN_AL_EMERGENCY: string | number
  INUSE?: number | string
  CREATE_DATE?: string
  CREATE_BY?: string
  UPDATE_DATE?: string
  UPDATE_BY?: string
}
