import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import HrSettingAPI from '@/_workspace/api/hr-setting/HrSettingAPI'
import type {
  SearchLeaveTypeRegulationParams,
  CreateLeaveTypeRegulationParams,
  UpdateLeaveTypeRegulationParams,
  DeleteLeaveTypeRegulationParams
} from '@/_workspace/types/hr-leave-type-regulation/HrLeaveTypeRegulationService'
export default class HrLeaveTypeRegulationService {
  static searchLeaveTypeRegulation(params: SearchLeaveTypeRegulationParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/searchLeaveTypeRegulation`,
      method: 'POST',
      data: params
    })
  }
  static getDepartment() {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/getDepartment`,
      method: 'POST'
    })
  }
  static createLeaveTypeRegulation(params: CreateLeaveTypeRegulationParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/createLeaveTypeRegulation`,
      method: 'POST',
      data: params
    })
  }
  static updateLeaveTypeRegulation(params: UpdateLeaveTypeRegulationParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/updateLeaveTypeRegulation`,
      method: 'POST',
      data: params
    })
  }
  static deleteLeaveTypeRegulation(params: DeleteLeaveTypeRegulationParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrSettingAPI.API_ROOT_URL}/deleteLeaveTypeRegulation`,
      method: 'POST',
      data: params
    })
  }
}
