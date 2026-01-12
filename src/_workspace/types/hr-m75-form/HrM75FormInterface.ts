export interface M75EmployeeItem {
    EMPLOYEE_CODE: string
    FULL_NAME?: string
    EMPLOYEE_NAME?: string
    EMPLOYEE_SURNAME?: string
    DEPARTMENT?: string
    SECTION?: string
}
export interface Create75FormParams {
    EMPLOYEE_CODE: M75EmployeeItem[]  
    CREATE_BY: string
    LEAVE_REQUEST_ID?: string
    LEAVE_TYPE: number
    START_DATE: string
    END_DATE: string
    LEAVE_TIME: string
    TOTAL_DAY_LEAVE: string
    REASON?: string
    REMARK?: string
}
export interface Create75FormResponse {
    Status: boolean
    Message: string
    MethodOnDb?: string
    ResultOnDb?: any[]
    TotalCountOnDb?: number
}
