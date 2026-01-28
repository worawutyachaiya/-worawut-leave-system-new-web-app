import EmployeeLeaveService from '@/_workspace/services/employee-leave/EmployeeLeaveService'
import { EmployeeLeaveI } from '@/_workspace/types/employee-leave/EmployeeLeave'

export interface EmployeeLeaveOption extends EmployeeLeaveI {}

const fetchDepartmentByLikeGroupByFromMember = (dataItem: string) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    const param = { DEPARTMENT: dataItem }
    EmployeeLeaveService.getDepartmentByLikeGroupByFromMember(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb || [])
      })
      .catch(error => {
        console.error('Error fetching departments:', error)
        resolve([])
      })
  })
}

const fetchByLikeEmployeeCodeByDept = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getByLikeEmployeeCodeByDept(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

const fetchByLikeEmployeeCodeByDeptAndSection = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getByLikeEmployeeCodeByDeptAndSection(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

const fetchByLikeEmployeeCodeWithoutDeptFitel = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getByLikeEmployeeCodeWithoutDeptFitel(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}
const fetchByLikeEmployeeCodeBySection = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getByLikeEmployeeCodeBySection(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}
const fetchEmployeeFullName = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getEmployeeFullName(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

const fetchEmployeeFullNameByDept = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getEmployeeFullNameByDept(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

const fetchEmployeeFullNameByDeptAndSection = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getEmployeeFullNameByDeptAndSection(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

const fetchEmployeeFullNameBySection = (dataItem: any) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    EmployeeLeaveService.getEmployeeFullNameBySection(dataItem)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
}

const fetchSectionByDepartmentFromMember = (deptName: string, sectName: string) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    const param = {
      DEPARTMENT: deptName,
      SECTION: sectName
    }
    EmployeeLeaveService.getSectionByDepartmentFromMember(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb || [])
      })
      .catch(error => {
        console.error('Error fetching sections:', error)
        resolve([])
      })
  })
}

const fetchSectionFromMember = (inputValue: string) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    const param = { SECTION: inputValue }
    EmployeeLeaveService.getSectionFromMember(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb || [])
      })
      .catch(error => {
        console.error('Error fetching sections:', error)
        resolve([])
      })
  })
}
const fetchEmployeeCodeByEmployeeCodeAndInuse = (inputValue: any, inuse: string) => {
  return new Promise<EmployeeLeaveOption[]>(resolve => {
    const param = { EMPLOYEE_CODE: inputValue, inuse: inuse }
    EmployeeLeaveService.getByLikeEmployeeCodeAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb || [])
      })
      .catch(error => {
        console.error('Error fetching sections:', error)
        resolve([])
      })
  })
}
export {
  fetchDepartmentByLikeGroupByFromMember,
  fetchByLikeEmployeeCodeByDept,
  fetchByLikeEmployeeCodeByDeptAndSection,
  fetchByLikeEmployeeCodeWithoutDeptFitel,
  fetchByLikeEmployeeCodeBySection,
  fetchEmployeeFullName,
  fetchEmployeeFullNameByDept,
  fetchEmployeeFullNameByDeptAndSection,
  fetchEmployeeFullNameBySection,
  fetchSectionByDepartmentFromMember,
  fetchSectionFromMember,
  fetchEmployeeCodeByEmployeeCodeAndInuse
}
