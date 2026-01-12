import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import TimeRecordService from '@/_workspace/services/time-record/TimeRecordService'
import { TimeRecordApprovalResponse } from '@/_workspace/types/time-record/TimeRecordInterface'

export const PREFIX_QUERY_KEY_EMPLOYEE_LEAVE = 'TIME_RECORD_APPROVAL_SEARCH'

export const useTimeRecordSearchApproval = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<TimeRecordApprovalResponse[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY_EMPLOYEE_LEAVE, params],
    queryFn: () => TimeRecordService.searchApprovalInFlow(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export const useTimeRecordCreateApproval = (onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
  return useMutation({
    mutationFn: (params: any) => TimeRecordService.createApproval(params),
    onSuccess,
    onError
  })
}
