import HrHolidayAPI from '@/_workspace/api/hr-holiday/HrHolidayAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import { GetHolidayParams, GetHolidayResponse } from '@/_workspace/types/hr-holiday/HrHolidayInterface'

export default class HrHolidayService {
    static getHoliday(params: GetHolidayParams) {
        return axiosRequest_LeaveSystem({
            url: HrHolidayAPI.API_ROOT_URL,
            data: params,
            method: 'POST'
        })
    }
}
