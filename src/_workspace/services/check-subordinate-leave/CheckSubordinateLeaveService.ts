import CheckSubordinateLeaveAPI from '@/_workspace/api/check-subordinate-leave/CheckSubordinateLeaveAPI'
import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import type {
  CalendarEvent,
  CheckSubordinateLeaveSearchParams
} from '@/_workspace/types/check-sorbordinate-leave/CheckSubordinateLeaveTypes'

export class CheckSubordinateLeaveService {
  static async getEvents(params: { START_DATE: string; END_DATE: string; EMPLOYEE_ID_REQUEST: string }) {
    // console.log('getEvents', params)
    return await axiosRequest_LeaveSystem({
      method: 'post',
      url: `${CheckSubordinateLeaveAPI.API_ROOT_URL}/events`,
      data: params
    })
  }

  static async getEventsByDate(params: { TARGET_DATE: string; EMPLOYEE_ID_REQUEST: string }) {
    return await axiosRequest_LeaveSystem({
      method: 'post',
      url: `${CheckSubordinateLeaveAPI.API_ROOT_URL}/events-by-date`,
      data: params
    })
  }

  static async searchSubordinateLeave(params: CheckSubordinateLeaveSearchParams & { EMPLOYEE_ID_REQUEST: string }) {
    return await axiosRequest_LeaveSystem({
      method: 'post',
      url: `${CheckSubordinateLeaveAPI.API_ROOT_URL}/search`,
      data: params
    })
  }

  static async getEmployeeLeaveUsage(params: { EMPLOYEE_CODE: string }) {
    return await axiosRequest_LeaveSystem({
      method: 'post',
      url: `${CheckSubordinateLeaveAPI.API_ROOT_URL}/employee-leave-usage`,
      data: params
    })
  }
}
