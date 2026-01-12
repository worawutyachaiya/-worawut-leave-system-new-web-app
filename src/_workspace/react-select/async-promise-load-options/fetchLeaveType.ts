import leaveTypeService from '@/_workspace/services/leave-type/LeaveTypeService'
import { LeaveTypeInterface } from '@/_workspace/types/leave-type/LeaveTypeInterface'

interface LeaveTypeOption extends LeaveTypeInterface {}

const fetchLeaveType = (inputValue: object) =>
  new Promise<LeaveTypeOption[]>(resolve => {
    // const param = {
    //   LEAVE_TYPE_DESCRIPTION: inputValue,
    //   INUSE: inuse
    // }
    leaveTypeService
      .getLeaveType(inputValue)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

// const fetchLeaveType = (dataItem) =>
//   new Promise((resolve) => {
//     LeaveInfoServices.getLeaveType(dataItem)
//       .then((responseJson) => {
//         resolve(responseJson.data.ResultOnDb);
//       })
//       .catch((error) => console.log(error));
//   });

export { fetchLeaveType }
