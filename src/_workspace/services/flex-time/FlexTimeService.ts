import FlexTimeAPI from '@/_workspace/api/flex-time/FlexTimeAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import type {
  FlexTimeSearchParams,
  FlexTimeHistorySearchParams,
  FlexTimeApprovalSearchParams,
  FlexTimeCreatePayload,
  FlexTimeUpdatePayload,
  FlexTimeHrCheckerUpdatePayload,
  FlexTimeApprovalPayload,
  UserFlexTimeUpdatePayload,
  UserFlexTimeDeletePayload
} from '@/_workspace/types/flex-time/FlexTimeInterface'
export default class FlexTimeService {
  static getAllByEmployeeId(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/getAllByEmployeeId`,
      method: 'POST',
      data: params
    })
  }
  static getFlexTime() {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/getFlexTime`,
      method: 'POST'
    })
  }
  static createFlexTime(dataItem: FlexTimeCreatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/createFlexTime`,
      method: 'POST',
      data: dataItem
    })
  }
  static searchInFlow(params: FlexTimeSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/searchInFlow`,
      method: 'POST',
      data: params
    })
  }
  static searchFlexTimeBySpecificDate(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/searchFlexTimeBySpecificDate`,
      method: 'POST',
      data: params
    })
  }
  static searchFlexTimeHistory(params: FlexTimeHistorySearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/history`,
      method: 'POST',
      data: params
    })
  }
  static searchForApprovalInFlow(params: FlexTimeApprovalSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/getApprovalInFlow`,
      method: 'POST',
      data: params
    })
  }
  static searchHistoryInFlowManager(params: FlexTimeSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/subordinate`,
      method: 'POST',
      data: params
    })
  }
  static searchHrChecker(params: FlexTimeSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/searchHrChecker`,
      method: 'POST',
      data: params
    })
  }
  static searchHrCheckerTableData(params: FlexTimeSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/hrCheck`,
      method: 'POST',
      data: params
    })
  }
  static searchHrCheckerTableDataForExport(params: FlexTimeSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/searchHrCheckerTableDataForExport`,
      method: 'POST',
      data: params
    })
  }
  static searchUserFlexTime(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/searchUser`,
      method: 'POST',
      data: params
    })
  }
  static searchCheckFlexTimeSubordinateCalendarBySpecificDate(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/searchCheckFlexTimeSubordinateCalendarBySpecificDate`,
      method: 'POST',
      data: params
    })
  }
  static update(dataItem: FlexTimeUpdatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/approval`,
      method: 'POST',
      data: dataItem
    })
  }
  static updateUserFlexTime(dataItem: UserFlexTimeUpdatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/updateUser`,
      method: 'POST',
      data: dataItem
    })
  }
  static delete(dataItem: any) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/delete`,
      method: 'POST',
      data: dataItem
    })
  }
  static deleteFlexTime(dataItem: UserFlexTimeDeletePayload) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/delete`,
      method: 'POST',
      data: dataItem
    })
  }
  static createApproval(dataItem: FlexTimeApprovalPayload) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/approval`,
      method: 'POST',
      data: dataItem
    })
  }
  static searchHistoryApprover(params: { FLEX_TIME_REQUEST_ID: string | number }) {
    return axiosRequest_LeaveSystem({
      url: `${FlexTimeAPI.API_ROOT_URL}/searchHistoryApprover`,
      method: 'POST',
      data: params
    })
  }
}
