import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import HrLeaveTypeRegulationService from '@/_workspace/services/hr-leave-type-regulation/HrLeaveTypeRegulationService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { LeaveTypeRegulationInterface } from '@/_workspace/types/hr-leave-type-regulation/HrLeaveTypeRegulation'
import type {
  SearchLeaveTypeRegulationParams,
  CreateLeaveTypeRegulationParams,
  UpdateLeaveTypeRegulationParams,
  DeleteLeaveTypeRegulationParams
} from '@/_workspace/types/hr-leave-type-regulation/HrLeaveTypeRegulationService'

export const PREFIX_QUERY_KEY = 'HR_SETTING_LEAVE_TYPE_REGULATION'
export const useSearchLeaveTypeRegulation = (params: SearchLeaveTypeRegulationParams, enabled: boolean = true) =>
  useQuery<AxiosResponseI<{ ResultOnDb: LeaveTypeRegulationInterface[]; TotalCountOnDb: number }>, Error>({
    queryKey: [PREFIX_QUERY_KEY, 'SEARCH', params],
    queryFn: () => HrLeaveTypeRegulationService.searchLeaveTypeRegulation(params),
    enabled
  })

export const useGetDepartment = () =>
  useQuery<AxiosResponseI<{ ResultOnDb: any[] }>, Error>({
    queryKey: [PREFIX_QUERY_KEY, 'DEPARTMENT_DROPDOWN'],
    queryFn: () => HrLeaveTypeRegulationService.getDepartment(),
    staleTime: 10 * 60 * 1000 // Cache for 10 mins
  })

export const useCreateLeaveTypeRegulation = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: CreateLeaveTypeRegulationParams) =>
      HrLeaveTypeRegulationService.createLeaveTypeRegulation(params),
    onSuccess,
    onError
  })
}

export const useUpdateLeaveTypeRegulation = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: UpdateLeaveTypeRegulationParams) =>
      HrLeaveTypeRegulationService.updateLeaveTypeRegulation(params),
    onSuccess,
    onError
  })
}

export const useDeleteLeaveTypeRegulation = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: DeleteLeaveTypeRegulationParams) =>
      HrLeaveTypeRegulationService.deleteLeaveTypeRegulation(params),
    onSuccess,
    onError
  })
}
