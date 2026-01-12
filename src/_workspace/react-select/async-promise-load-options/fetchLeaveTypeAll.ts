import leaveTypeAllService from '@/_workspace/services/leave-type-all/LeaveTypeAllService'
import { LeaveTypeAllInterface } from '@/_workspace/types/leave-type-all/LeaveTypeAllInterface';

const fetchLeaveTypeAll = () => {
  return new Promise<LeaveTypeAllInterface[]>((resolve) => {
    leaveTypeAllService.getLeaveTypeAll({ IS_HR_FORM: true })
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })
}

export{fetchLeaveTypeAll}