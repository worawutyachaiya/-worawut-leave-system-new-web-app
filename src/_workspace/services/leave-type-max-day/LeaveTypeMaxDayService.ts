import LeaveTypeMaxDayAPI from '@/_workspace/api/leave-type-max-day/LeaveTypeMaxDayAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class LeaveTypeMaxDayService {
  static getLeaveTypeMaxDay(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeMaxDayAPI.API_ROOT_URL}/getLeaveTypeMaxDay`,
      data: params,
      method: 'POST'
    })
  }
}
