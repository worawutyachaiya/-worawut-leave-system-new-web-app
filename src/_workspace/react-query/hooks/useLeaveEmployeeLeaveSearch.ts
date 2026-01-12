import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import EmployeeLeaveService from '@/_workspace/services/employee-leave/EmployeeLeaveService'
import { EmployeeLeaveInterface } from '@/_workspace/types/employee-leave/EmployeeLeaveInterface'

export const PREFIX_QUERY_KEY_EMPLOYEE_LEAVE = 'EMPLOYEE_LEAVE_SEARCH'

const useLeaveEmployeeSearch = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<EmployeeLeaveInterface[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY_EMPLOYEE_LEAVE, params],
    queryFn: () => EmployeeLeaveService.getEmployeeLeave(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export { useLeaveEmployeeSearch }
