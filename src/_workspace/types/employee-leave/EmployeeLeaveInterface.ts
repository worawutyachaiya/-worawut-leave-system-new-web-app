export interface EmployeeLeaveInterface {
    LEAVE_REQUEST_ID?: string | number
    EMPLOYEE_ID?: string
    EMPLOYEE_CODE?: string
    EMPLOYEE_SURNAME?: string
    EMPLOYEE_NAME?: string 
    EMPLOYEE_DEPT?: string
    EMPLOYEE_SECTION?: string
    LEAVE_TYPE_ID?: number
    LEAVE_TYPE_CODE?: string
    LEAVE_TYPE_DESCRIPTION?: string 
    LEAVE_TYPE_DESCRIPTION_EN?: string
    LEAVE_TYPE_DESCRIPTION_TH?: string
    LEAVE_REQUEST_START_DATE?: string
    LEAVE_REQUEST_END_DATE?: string
    LEAVE_REQUEST_TIME?: string
    LEAVE_REQUEST_TOTAL_DAY?: number | string
    LEAVE_REQUEST_REASON?: string
    LEAVE_REQUEST_REMARK?: string
    LEAVE_REQUEST_FILE_UPLOAD_NAME?: string
    LEAVE_REQUEST_FILE_UPLOAD_PATH?: string
    LEAVE_REQUEST_STATUS?: string
    IS_APPROVER_APPROVED?: string
    INUSE?: number | string
    CREATE_DATE?: string
    CREATE_BY?: string
    UPDATE_DATE?: string
    UPDATE_BY?: string
}
