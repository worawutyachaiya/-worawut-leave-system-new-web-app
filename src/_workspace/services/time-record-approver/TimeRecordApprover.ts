import TimeRecordAPI from '@/_workspace/api/time-record/TimeRecordAPI'
import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class ApproverService {
  static searchApprover(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/searchTimeRecordApprover`,
      data: params,
      method: 'POST'
    })
  }
}
