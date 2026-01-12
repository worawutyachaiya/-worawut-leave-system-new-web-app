import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import EmployeeLeaveAPI from '@/_workspace/api/employee-leave/EmployeeLeaveAPI'
export default class EmployeeLeaveService {
  static getDepartmentByLikeGroupByFromMember(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getDepartmentByLikeGroupByFromMember`,
      method: 'POST',
      data: property
    })
  }
  static getByLikeEmployeeCodeByDept(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getByLikeEmployeeCodeByDept`,
      method: 'POST',
      data: property
    })
  }
  static getByLikeEmployeeCodeByDeptAndSection(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getByLikeEmployeeCodeByDeptAndSection`,
      method: 'POST',
      data: property
    })
  }
  static getByLikeEmployeeCodeWithoutDeptFitel(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getByLikeEmployeeCodeWithoutDeptFitel`,
      method: 'POST',
      data: property
    })
  }
  static getByLikeEmployeeCodeAndInFlowAndInuse(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getByLikeEmployeeCodeAndInFlowAndInuse`,
      method: 'POST',
      data: property
    })
  }
  static getByLikeEmployeeCodeBySection(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getByLikeEmployeeCodeBySection`,
      method: 'POST',
      data: property
    })
  }
  static getEmployeeFullName(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getEmployeeFullName`,
      method: 'POST',
      data: property
    })
  }
  static getEmployeeFullNameByDept(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getEmployeeFullNameByDept`,
      method: 'POST',
      data: property
    })
  }
  static getEmployeeFullNameByDeptAndSection(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getEmployeeFullNameByDeptAndSection`,
      method: 'POST',
      data: property
    })
  }
  static getEmployeeFullNameBySection(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getEmployeeFullNameBySection`,
      method: 'POST',
      data: property
    })
  }
  static getSectionByDepartmentFromMember(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getSectionByDepartmentFromMember`,
      method: 'POST',
      data: property
    })
  }
  static getSectionFromMember(property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getSectionFromMember`,
      method: 'POST',
      data: property
    })
  }
  static getEmployeeLeave(Property: any) {
    return axiosRequest_LeaveSystem({
      url: `${EmployeeLeaveAPI.API_ROOT_URL}/getEmployeeLeave`,
      method: 'POST',
      data: Property
    })
  }
}
