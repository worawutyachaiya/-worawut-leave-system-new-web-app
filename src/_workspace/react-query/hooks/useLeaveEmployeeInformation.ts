import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import LeaveService from '@/_workspace/services/leave-employee-information/LeaveEmployeeInformationService'
import { LeaveEmployeeInformationInterface } from '@/_workspace/types/leave-employee-information/LeaveEmployeeInformationInterface'

export const PREFIX_QUERY_KEY = 'EMPLOYEE_LEAVE'

const useSearchEmployeeInformation = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<LeaveEmployeeInformationInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => LeaveService.searchEmployeeByEmployeeCode(params),
    placeholderData: keepPreviousData,
    //staleTime: 0,
    enabled: isFetchData
  })

export { useSearchEmployeeInformation }

// employee/searchEmployeeByEmployeeCode?data=%7B%22EMPLOYEE_CODE%22:%22s524%22%7D
// employee/searchEmployeeByEmployeeCode?data=%7B%22EMPLOYEE_CODE%22:%22S524%22%7D
