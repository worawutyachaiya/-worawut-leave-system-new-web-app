import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import UserLeaveAPI from '@/_workspace/api/user-leave/UserLeaveAPI'
import { SearchUserLeaveParams, UpdateUserLeaveParams, DeleteUserLeaveParams } from '@/_workspace/types/hr-user-leave/HrUserLeaveService'
export default class UserLeaveService {
  static searchUserLeave(params: SearchUserLeaveParams) {
    return axiosRequest_LeaveSystem({
      url: `${UserLeaveAPI.API_ROOT_URL}/searchUserLeave`,
      method: 'POST',
      data: params
    })
  }
  static updateUserLeave(params: UpdateUserLeaveParams) {
    return axiosRequest_LeaveSystem({
      url: `${UserLeaveAPI.API_ROOT_URL}/updateUserLeave`,
      method: 'POST',
      data: params
    })
  }
  static deleteUserLeave(params: DeleteUserLeaveParams) {
    return axiosRequest_LeaveSystem({
      url: `${UserLeaveAPI.API_ROOT_URL}/deleteUserLeave`,
      method: 'POST',
      data: params
    })
  }
}
