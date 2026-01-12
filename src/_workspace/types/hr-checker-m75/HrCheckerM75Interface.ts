export interface HrCheckerM75SearchParams {
    EMPLOYEE_CODE?: string
    LEAVE_TYPE?: any
    START_DATE?: string
    END_DATE?: string
    STATUS?: string
    STATUS_FOR_APPROVE?: string
    M75?: boolean
    Start?: number
    Limit?: number
    Order?: any
}

export interface HrCheckerM75ResponseData {
    LEAVE_REQUEST_ID: number
    LEAVE_REQUEST_EMPLOYEE_ID: string
    EMPLOYEE_NAME: string
    EMPLOYEE_SURNAME: string
    EMPLOYEE_FULL_NAME: string
    EMPLOYEE_SECTION: string
    LEAVE_TYPE_DESCRIPTION_TH: string
    LEAVE_REQUEST_TIME: string
    LEAVE_REQUEST_TOTAL_DAY: number
    LEAVE_REQUEST_START_DATE: string
    LEAVE_REQUEST_END_DATE: string
    LEAVE_DATE_RANGE: string
    LEAVE_REQUEST_REASON: string
    LEAVE_REQUEST_REMARK: string
    TYPE: string
    LEAVE_REQUEST_STATUS: number
    IS_APPROVED: number
    IS_APPROVER_APPROVED: number
    CHECKED: number | null
    approveNo1: string
    approveNo2: string
    approveNo3: string
    approveNo4: string
    approveNo5: string
    APPROVER: string[]
    LEAVE_REQUEST_FILE_UPLOAD_NAME: string | null
    LEAVE_REQUEST_FILE_UPLOAD_PATH: string | null
    CREATE_DATE: string
    REAL_CREATE_DATE: string
    UPDATE_DATE: string
    CREATE_BY: string
    UPDATE_BY: string
    IN_TIME: string | null
    OUT_TIME: string | null
    LEAVE_REQUEST_EMPLOYEE_CODE: string
    Approval_1?: string
    Approval_2?: string
    Approval_3?: string
    Approval_4?: string
    Approval_5?: string
    INUSE?: number | string
    [key: string]: any
}

export interface HrCheckerM75ResponseI {
    Status: boolean
    Message: string
    ResultOnDb: HrCheckerM75ResponseData[][]
    MethodOnDb: string
    TotalCountOnDb: number
}
