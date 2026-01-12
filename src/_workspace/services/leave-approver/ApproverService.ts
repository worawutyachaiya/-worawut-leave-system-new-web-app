import LeaveApproverAPI from '@/_workspace/api/leave-approver/LeaveApproverAPI'
import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export interface SearchApproverParams {
  LEAVE_REQUEST_ID: string | number
  TYPE?: string
}
export interface ApproverResult {
  APPROVAL_BY_APPROVER_EMPLOYEE_ID: string
  APPROVAL_STATUS_ID: number | string
  APPROVER_NAME?: string
}
export default class ApproverService {
  static searchApprover(params: SearchApproverParams) {
    const data = JSON.stringify(params)
    return axiosRequest_LeaveSystem({
      url: `${LeaveApproverAPI.API_ROOT_URL}/searchHistoryApprover`,
      data: data,
      method: 'POST'
    })
  }
}
