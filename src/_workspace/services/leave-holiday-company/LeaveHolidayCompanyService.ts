import LeaveHolidayCompanyAPI from '@/_workspace/api/leave-holiday-company/LeaveHolidayCompanyAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class LeaveHolidayCompany {
  static getAll(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveHolidayCompanyAPI.API_ROOT_URL}/getAllCompanyHoliday`,
      data: params,
      method: 'POST'
    })
  }
}
