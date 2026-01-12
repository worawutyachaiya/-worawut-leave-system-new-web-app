import LeaveTypeAPI from '@/_workspace/api/leave-type/LeaveTypeAPI';
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem';
export default class leaveTypeService {
static getLeaveType(property:any) {
    return axiosRequest_LeaveSystem({
      url: `${LeaveTypeAPI.API_ROOT_URL}/type`,
      data: property,
      method: 'POST',
    });
  }
}