import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import HrSettingAPI from '@/_workspace/api/hr-setting/HrSettingAPI'
import type {
  SearchLeaveTypeParams,
  UpdateLeaveTypeParams,
  DeleteLeaveTypeParams
} from '@/_workspace/types/hr-leave-type-name/HrLeaveTypeNameService'
export default class HrLeaveTypeNameService {
  static searchLeaveType(params: SearchLeaveTypeParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/searchLeaveType`,
      method: 'POST',
      data: params
    })
  }
  static deleteLeaveType(params: DeleteLeaveTypeParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/deleteLeaveType`,
      method: 'POST',
      data: params
    })
  }
  static updateLeaveType(params: UpdateLeaveTypeParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/updateLeaveType`,
      method: 'POST',
      data: params
    })
  }
}
