import LeaveEmployeeAPI from '@/_workspace/api/leave-employee/LeaveEmployeeAPI'
import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class EmployeeService {
  static getEmployeeLeave(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveEmployeeAPI.API_ROOT_URL}/getEmployeeLeave`,
      method: 'POST',
      data: property
    })
  }
}
