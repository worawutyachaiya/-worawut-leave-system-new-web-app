import leaveTypeHrService from '@/_workspace/services/leaveTypeHr/LeaveTypeHrService'
import { LeaveTypeHrInterface } from '@/_workspace/types/leave-type-hr/LeaveTypeHrInterface';

const fetchLeaveTypeHR = async (): Promise<LeaveTypeHrInterface[]> => {
  try {
    const response: any = await leaveTypeHrService.getLeaveTypeHr({ IS_HR_FORM: true });
    return response?.data?.ResultOnDb ?? [];
  } catch (error: any) {
    console.log(error);
    return [];
  }
}

export default fetchLeaveTypeHR;