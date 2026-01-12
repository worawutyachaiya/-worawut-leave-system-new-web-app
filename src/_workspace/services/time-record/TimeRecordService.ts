import TimeRecordAPI from '@/_workspace/api/time-record/TimeRecordAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import type {
  TimeRecordRequestCreatePayload,
  TimeRecordSearchParams,
  TimeRecordHRCheckerSearchParams,
  TimeRecordApprovalPayload
} from '@/_workspace/types/time-record/TimeRecordInterface'
import { DeleteTimeRecordParams } from '@/_workspace/types/time-record/TimeRecordInterface'
export default class TimeRecordService {
  static create(dataItem: TimeRecordRequestCreatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/create`,
      method: 'POST',
      data: dataItem
    })
  }
  static createHrChecker(dataItem: TimeRecordRequestCreatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/createHrChecker`,
      method: 'POST',
      data: dataItem
    })
  }
  static createApproval(dataItem: TimeRecordApprovalPayload) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/approval`,
      method: 'POST',
      data: dataItem
    })
  }
  static search(params: TimeRecordSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/search`,
      method: 'POST',
      data: params
    })
  }
  static searchHRChecker(params: TimeRecordHRCheckerSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/searchHRChecker`,
      method: 'POST',
      data: params
    })
  }
  static searchHrCheckerTableDataForExport(params: TimeRecordHRCheckerSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/searchHrCheckerTableDataForExport`,
      method: 'POST',
      data: params
    })
  }
  static searchApprovalInFlow(params: any) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/searchApprovalInFlow`,
      method: 'POST',
      data: params
    })
  }
  static searchTimeRecordType() {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/getTimeRecordType`,
      method: 'POST'
    })
  }
  static get(property: { TIME_RECORD_REQUEST_ID: string }) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/get`,
      method: 'POST',
      data: property
    })
  }
  static update(property: Partial<TimeRecordRequestCreatePayload>) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/update`,
      method: 'POST',
      data: property
    })
  }
  static deleteTimeRecord(property: DeleteTimeRecordParams) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/delete`,
      data: property,
      method: 'POST'
    })
  }
  static deleteByHr(property: { TIME_RECORD_REQUEST_ID: string }) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/deleteByHr`,
      method: 'POST',
      data: property
    })
  }
  static searchCheckSubordinateTimeRecord(params: TimeRecordSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${TimeRecordAPI.API_ROOT_URL}/getCheckSubordinate`,
      method: 'POST',
      data: params
    })
  }
}
