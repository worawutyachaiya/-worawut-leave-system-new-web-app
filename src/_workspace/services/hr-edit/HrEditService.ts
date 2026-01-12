import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import HrEditAPI from '@/_workspace/api/hr-edit/HrEditAPI'
import { SearchEmployeeProbationParams, SetPassProParams } from '@/_workspace/types/hr-user-probation/HrUserProbation'
import { UserProbationInterface } from '@/_workspace/types/hr-user-probation/HrUserProbation'
export default class HrEditService {
    static searchEmployeeProbation(params: any) {
        return axiosRequest_LeaveSystem({
            url: `${HrEditAPI.API_ROOT_URL}/searchEmployeeProbation`,
            method: 'POST',
            data: params
        })
    }
    static setPassPro(params: SetPassProParams) {
        return axiosRequest_LeaveSystem({
            url: `${HrEditAPI.API_ROOT_URL}/setPassPro`,
            method: 'POST',
            data: params
        })
    }
}
