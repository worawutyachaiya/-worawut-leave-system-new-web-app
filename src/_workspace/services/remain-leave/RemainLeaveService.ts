import RemainLeaveAPI from '@/_workspace/api/remain-leave/RemainLeaveAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class RemainLeaveService {
  static getRemainLeave(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${RemainLeaveAPI.API_ROOT_URL}/searchRemainLeave`,
      data: params,
      method: 'POST'
    })
  }
  static getAllEmployee(dataItem: any) {
    return axiosRequest_LeaveSystem({
      url: `${RemainLeaveAPI.API_ROOT_URL}/getAllEmployee`,
      data: dataItem,
      method: 'POST'
    })
  }
  static updateRemainLeave(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${RemainLeaveAPI.API_ROOT_URL}/updateRemainLeave`,
      data: params,
      method: 'POST'
    })
  }
}
