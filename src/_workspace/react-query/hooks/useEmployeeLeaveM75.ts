import { keepPreviousData, useQuery } from '@tanstack/react-query'
import EmployeeLeaveM75Service from '@/_workspace/services/employee-leave-m75/EmployeeLeaveM75Service'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type {
  EmployeeLeaveM75ResponseI,
  EmployeeLeaveM75SearchI
} from '@/_workspace/types/employee-leave-m75/EmployeeLeaveM75Interface'

export const PREFIX_QUERY_KEY = 'EMPLOYEE_LEAVE_M75'

export const useSearchEmployeeLeaveM75 = (params: EmployeeLeaveM75SearchI, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<EmployeeLeaveM75ResponseI>>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => EmployeeLeaveM75Service.searchEmployeeLeaveM75(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchEmployeeLeaveM75ForExport = (params: EmployeeLeaveM75SearchI, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<EmployeeLeaveM75ResponseI>>({
    queryKey: [`${PREFIX_QUERY_KEY}_FOR_EXPORT`, params],
    queryFn: () => EmployeeLeaveM75Service.searchEmployeeLeaveM75TableDataForExport(params),
    placeholderData: keepPreviousData,
    enabled
  })
}
