export interface SearchEmployeeProbationParams {
  Start?: string
  Limit?: string
  Order?: Array<{ id: string; desc: boolean }>
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_DEPT?: string
  IS_PASS_PRO?: string | number
}
export interface UserProbationInterface {
  EMPLOYEE_CODE: string
  EMPLOYEE_NAME: string
  EMPLOYEE_SURNAME: string
  EMPLOYEE_SECTION: string
  EMPLOYEE_DEPT: string
  EMPLOYEE_START_WORK: string
  IS_PASS_PRO: number
  PASS_PRD?: boolean
  PASS_PRD_DATE?: string | null
}
export interface SetPassProParams {
  EMPLOYEE_CODE: string
  UPDATE_DATE: string
  UPDATE_BY?: string
}
