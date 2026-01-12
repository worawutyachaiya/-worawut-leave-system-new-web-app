import LeaveEmployeeInformationService from '@/_workspace/services/leave-employee-information/LeaveEmployeeInformationService'
import { SectionInterface } from '@/_workspace/types/leave-employee-information/LeaveEmployeeInformationInterface'

const fetchSection = (inputValue: string): Promise<SectionInterface[]> => {
  return new Promise<SectionInterface[]>(resolve => {
    const param = {
      SECT_NAME: inputValue,
      INUSE: 1
    }
    
    LeaveEmployeeInformationService.getSection(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => {
        console.error('Error fetching sections:', error?.message || error)
        resolve([])
      })
  })
}

export { fetchSection }
