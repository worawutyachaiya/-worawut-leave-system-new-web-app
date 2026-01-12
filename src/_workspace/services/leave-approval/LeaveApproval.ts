import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import LeaveApprovalAPI from '@/_workspace/api/leave-approval/LeaveApprovalAPI'
export interface ApprovalRowAction {
    LEAVE_REQUEST_ID: string;
    EMPLOYEE_CODE: string;
}
export interface CreateApprovalParams {
    rowAction: ApprovalRowAction[];
    approvalBy: string;
    approvalStatus: number;  
    remark?: string;
}
export default class LeaveApprovalService {
    static searchForApprovalInFlow(property: any) {
        return axiosRequest_LeaveSystem({
            url: `${LeaveApprovalAPI.API_ROOT_URL}/searchForApprovalInFlow`,
            method: 'POST',
            data: property
        })
    }
    static createApproval(property: CreateApprovalParams) {
        return axiosRequest_LeaveSystem({
            url: `${LeaveApprovalAPI.API_ROOT_URL}/create`,
            method: 'POST',
            data: property
        })
    }
}
