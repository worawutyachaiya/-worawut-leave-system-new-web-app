import RemainLeaveService from '@/_workspace/services/remain-leave/RemainLeaveService'
import { EmployeeLeaveI } from '@/_workspace/types/employee-leave/EmployeeLeave'

export interface AllEmployeeOption extends EmployeeLeaveI {}

const fetchAllEmployee = (dataItem: any) => {
  return new Promise<AllEmployeeOption[]>(resolve => {
    RemainLeaveService.getAllEmployee(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

export { fetchAllEmployee }

