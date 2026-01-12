import HrCheckerM75API from '@/_workspace/api/hr-checker-m75/HrCheckerM75API'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import type { HrCheckerM75SearchParams } from '@/_workspace/types/hr-checker-m75/HrCheckerM75Interface'

interface HrCheckerM75Payload {
    rowAction: Array<{
        LEAVE_REQUEST_ID: string
        TYPE: string
    }>
    approvalBy: string
    totalCount?: number
}

export default class HrCheckerM75Service {
    static searchHrCheckerM75(params: HrCheckerM75SearchParams) {
        return axiosRequest_LeaveSystem({
            url: `${HrCheckerM75API.API_ROOT_URL}/searchHrChecker`,
            method: 'POST',
            data: params
        })
    }

    static createHrCheckerM75(payload: HrCheckerM75Payload) {
        return axiosRequest_LeaveSystem({
            url: `${HrCheckerM75API.API_ROOT_URL}/createHrCheckerM75`,
            method: 'POST',
            data: payload
        })
    }
}
