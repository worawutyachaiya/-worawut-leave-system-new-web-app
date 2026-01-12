import EmployeeLeaveM75API from '@/_workspace/api/employee-leave-m75/EmployeeLeaveM75API'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import type { EmployeeLeaveM75SearchI } from '@/_workspace/types/employee-leave-m75/EmployeeLeaveM75Interface'
export default class EmployeeLeaveM75Service {
  static searchEmployeeLeaveM75(params: EmployeeLeaveM75SearchI) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveM75API.API_ROOT_URL}/search`,
      method: 'POST',
      data: params
    })
  }
  static searchEmployeeLeaveM75TableDataForExport(params: EmployeeLeaveM75SearchI) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveM75API.API_ROOT_URL}/searchForExport`,
      method: 'POST',
      data: params
    })
  }
}
