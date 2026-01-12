import HrLeaveTypeRegulationService from '@/_workspace/services/hr-leave-type-regulation/HrLeaveTypeRegulationService'

export const fetchDepartmentAll = () => {
  return new Promise<any[]>((resolve) => {
    HrLeaveTypeRegulationService.getDepartment()
      .then(responseJson => {
        const departments = responseJson.data.ResultOnDb || []
        resolve(departments)
      })
      .catch(error => {
        console.log(error)
        resolve([])
      })
  })
}
