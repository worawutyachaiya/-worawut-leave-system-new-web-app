export interface CreateFormParams {
    LEAVE_TYPE: string
    START_DATE: string
    END_DATE: string
    LEAVE_TIME: string
    TOTAL_DAY_LEAVE: string
    REASON?: string
    REMARK?: string
    EMPLOYEE_CODE: string
    LEAVE_REQUEST_FILE_UPLOAD_ID?: string
}

export interface CreateFormResponse {
    Status: boolean
    Message: string
    MethodOnDb?: string
    ResultOnDb?: any
    TotalCountOnDb?: number
}
