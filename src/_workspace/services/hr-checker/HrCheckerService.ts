import HrCheckerAPI from '@/_workspace/api/hr-checker/HrCheckerAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import type { HrCheckerSearchParams, HrCheckerUpdatePayload } from '@/_workspace/types/hr-checker/HrCheckerInterface'
export default class HrCheckerService {
  static searchHrChecker(params: HrCheckerSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrCheckerAPI.API_ROOT_URL}/searchHrChecker`,
      method: 'POST',
      data: params
    })
  }
  static searchHrCheckerTableDataForExport(params: HrCheckerSearchParams) {
    return axiosRequest_LeaveSystem({
      url: `${HrCheckerAPI.API_ROOT_URL}/searchHrCheckerTableDataForExport`,
      method: 'POST',
      data: params
    })
  }
  static createHrChecker(dataItem: HrCheckerUpdatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${HrCheckerAPI.API_ROOT_URL}/createHrChecker`,
      method: 'POST',
      data: dataItem
    })
  }
  static updateHrChecker(dataItem: HrCheckerUpdatePayload) {
    return axiosRequest_LeaveSystem({
      url: `${HrCheckerAPI.API_ROOT_URL}/update`,
      method: 'POST',
      data: dataItem
    })
  }
}
