import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import LeaveTypeSettingService from '@/_workspace/services/leave-type-setting/LeaveTypeSettingService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type {
  LeaveTypeResponse,
  LeaveTypeSearchParams,
  LeaveTypeCreatePayload
} from '@/_workspace/types/leave-type-setting/LeaveTypeSettingInterface'

export const PREFIX_QUERY_KEY = 'LEAVE_TYPE_SETTING'

export const useSearchLeaveType = (params: LeaveTypeSearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<LeaveTypeResponse>>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => LeaveTypeSettingService.search(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useGetAllLeaveTypes = (enabled: boolean = true) => {
  return useQuery<AxiosResponseI<LeaveTypeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_ALL`],
    queryFn: () => LeaveTypeSettingService.getAll(),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useCreateLeaveType = (
  onSuccess?: (data: AxiosResponseI<LeaveTypeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: LeaveTypeCreatePayload) => LeaveTypeSettingService.create(dataItem),
    onSuccess,
    onError
  })
}

export const useUpdateLeaveType = (
  onSuccess?: (data: AxiosResponseI<LeaveTypeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: LeaveTypeCreatePayload & { LEAVE_TYPE_ID: number }) =>
      LeaveTypeSettingService.update(dataItem),
    onSuccess,
    onError
  })
}

export const useDeleteLeaveType = (
  onSuccess?: (data: AxiosResponseI<LeaveTypeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (leaveTypeId: number) => LeaveTypeSettingService.delete(leaveTypeId),
    onSuccess,
    onError
  })
}
