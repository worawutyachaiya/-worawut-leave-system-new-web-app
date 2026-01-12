import LeaveTypeAPI from '@/_workspace/api/leave-type/LeaveTypeAPI';
import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem';
export default class leaveTypeHrService {
static getLeaveTypeHr(property:any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeAPI.API_ROOT_URL}/getLeaveTypeOnlyHR`,
      data: property,
      method: 'POST',
    });
  }
}