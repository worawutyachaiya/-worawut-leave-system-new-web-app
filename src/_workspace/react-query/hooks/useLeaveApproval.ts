import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import LeaveApprovalService, { CreateApprovalParams } from '@/_workspace/services/leave-approval/LeaveApproval'
import { EmployeeLeaveInterface } from '@/_workspace/types/employee-leave/EmployeeLeaveInterface'

export const PREFIX_QUERY_KEY_EMPLOYEE_LEAVE = 'Leave_APPROVAL_SEARCH'

export const useLeaveEmployeeSearch = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<EmployeeLeaveInterface[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY_EMPLOYEE_LEAVE, params],
    queryFn: () => LeaveApprovalService.searchForApprovalInFlow(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export const useLeaveApprovalCreate = (onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
  return useMutation({
    mutationFn: (params: CreateApprovalParams) => LeaveApprovalService.createApproval(params),
    onSuccess,
    onError
  })
}
