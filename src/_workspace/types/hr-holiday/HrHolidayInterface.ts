export interface GetHolidayParams {
    startDate: string
    endDate: string
}

export interface HolidayItem {
    day_holiday: string
    title_holiday: string
}

export interface GetHolidayResponse {
    Status: boolean
    Message: string
    MethodOnDb?: string
    ResultOnDb?: HolidayItem[]
    TotalCountOnDb?: number
}
