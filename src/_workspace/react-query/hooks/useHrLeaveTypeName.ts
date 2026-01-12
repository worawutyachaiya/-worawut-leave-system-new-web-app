import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import HrLeaveTypeNameService from '@/_workspace/services/hr-leave-type-name/HrLeaveTypeNameService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { LeaveTypeInterface } from '@/_workspace/types/hr-leave-type-name/HrLeaveTypeName'
import type {
  SearchLeaveTypeParams,
  UpdateLeaveTypeParams,
  DeleteLeaveTypeParams
} from '@/_workspace/types/hr-leave-type-name/HrLeaveTypeNameService'

export const PREFIX_QUERY_KEY = 'HR_SETTING_LEAVE_TYPE'

export const useSearchLeaveType = (params: SearchLeaveTypeParams, enabled: boolean = true) =>
  useQuery<AxiosResponseI<{ ResultOnDb: LeaveTypeInterface[]; TotalCountOnDb: number }>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => HrLeaveTypeNameService.searchLeaveType(params),
    placeholderData: keepPreviousData,
    enabled
  })

export const useDeleteLeaveType = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: DeleteLeaveTypeParams) => HrLeaveTypeNameService.deleteLeaveType(params),
    onSuccess,
    onError
  })
}

export const useUpdateLeaveType = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: UpdateLeaveTypeParams) => HrLeaveTypeNameService.updateLeaveType(params),
    onSuccess,
    onError
  })
}
