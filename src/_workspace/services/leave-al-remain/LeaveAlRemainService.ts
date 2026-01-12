import LeaveAlRemainAPI from '@/_workspace/api/leave-al-remain/LeaveAlRemainAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class LeaveAlRemainService {
  static searchRemainALInFlow(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveAlRemainAPI.API_ROOT_URL}/searchRemainALInFlow`,
      data: params,
      method: 'POST'
    })
  }
}
