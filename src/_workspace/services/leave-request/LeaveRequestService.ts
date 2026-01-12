import LeaveRequestAPI from '@/_workspace/api/leave-request/LeaveRequestAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class LeaveRequestService {
  static create(dataItem: Record<string, any>) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveRequestAPI.API_ROOT_URL}/createLeave`,
      method: 'POST',
      data: dataItem
    })
  }
}
