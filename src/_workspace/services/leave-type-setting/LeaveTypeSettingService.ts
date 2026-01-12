import LeaveTypeSettingAPI from '@/_workspace/api/leave-type-setting/LeaveTypeSettingAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import type {
  LeaveTypeSearchParams,
  LeaveTypeCreatePayload
} from '@/_workspace/types/leave-type-setting/LeaveTypeSettingInterface'
export default class LeaveTypeSettingService {
  static search(params: LeaveTypeSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeSettingAPI.API_ROOT_URL}/searchLeaveType`,
      method: 'GET',
      params: { data: JSON.stringify(params) }
    })
  }
  static getAll() {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeSettingAPI.API_ROOT_URL}/getLeaveType`,
      method: 'GET'
    })
  }
  static create(dataItem: LeaveTypeCreatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeSettingAPI.API_ROOT_URL}/createLeaveType`,
      method: 'POST',
      data: dataItem
    })
  }
  static update(dataItem: LeaveTypeCreatePayload & { LEAVE_TYPE_ID: number }) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeSettingAPI.API_ROOT_URL}/updateLeaveType`,
      method: 'PATCH',
      data: dataItem
    })
  }
  static delete(leaveTypeId: number) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeSettingAPI.API_ROOT_URL}/deleteLeaveType`,
      method: 'DELETE',
      data: { LEAVE_TYPE_ID: leaveTypeId }
    })
  }
}
