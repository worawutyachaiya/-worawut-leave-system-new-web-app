import LeaveHistoryAPI from '@/_workspace/api/leave-history/leaveHistoryApi'
import LeaveRequestAPI from '@/_workspace/api/leave-request/LeaveRequestAPI'
import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export interface DeleteLeaveParams {
  LEAVE_REQUEST_ID: string | number
  EMPLOYEE_CODE: string
  LEAVE_TYPE_ID: number
  LEAVE_REQUEST_TOTAL_DAY: number | string
  LEAVE_REQUEST_START_DATE: string
  LEAVE_REQUEST_END_DATE: string
  LEAVE_TYPE_DESCRIPTION_TH?: string
}
export default class LeaveHistoryService {
  static getHistory(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveHistoryAPI.API_ROOT_URL}/history`,
      data: property,
      method: 'POST'
    })
  }
  static deleteLeave(property: DeleteLeaveParams) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveRequestAPI.API_ROOT_URL}/deleteLeave`,
      data: property,
      method: 'POST'
    })
  }
}
