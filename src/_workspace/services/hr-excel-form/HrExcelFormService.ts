import HrExcelFormAPI from '@/_workspace/api/hr-excel-form/HrExcelFormAPI'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import { CreateFormParams, CreateFormResponse } from '@/_workspace/types/hr-excel-form/HrExcelFormInterface'

export default class HrExcelFormService {
    static create(params: CreateFormParams) {
        return axiosRequest_LeaveSystem({
            url: `${HrExcelFormAPI.API_ROOT_URL}/create`,
            data: params,
            method: 'POST'
        })
    }
}
