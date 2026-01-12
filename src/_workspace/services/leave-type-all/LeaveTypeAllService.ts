import LeaveTypeAllAPI from '@/_workspace/api/leave-type/LeaveTypeAPI';
import axiosRequest_LeaveSystem from '@_workspace/axios/leave-system/axiosRequest_LeaveSystem';
export default class leaveTypeAllService {
static getLeaveTypeAll(property:any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeAllAPI.API_ROOT_URL}/typeAll`,
      data: property,
      method: 'POST',
    });
  }
}