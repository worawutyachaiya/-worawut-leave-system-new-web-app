import LeaveEmployeeInformationAPI from '@/_workspace/api/leave-employee-information/LeaveEmployeeInformationAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
export default class LeaveEmployeeInformationService {
  static searchEmployeeByEmployeeCode(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveEmployeeInformationAPI.API_ROOT_URL}/searchEmployeeByEmployeeCode`,
      data: params,
      method: 'POST'
    })
  }
  static getSection(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveEmployeeInformationAPI.API_ROOT_URL}/getSection`,
      method: 'POST',
      data: params
    })
  }
}
