import LeaveEmployeeBalanceAPI from '@/_workspace/api/leave-employee-balance/LeaveEmployeeBalanceAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
interface SearchParams {
  EMPLOYEE_CODE?: string
}
export default class EmployeeLeaveBalanceService {
  static search(params: SearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveEmployeeBalanceAPI.API_ROOT_URL}/searchRemainLeave`,
      data: params,
      method: 'POST'
    })
  }
}
