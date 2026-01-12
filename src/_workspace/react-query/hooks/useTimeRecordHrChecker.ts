import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import TimeRecordService from '@/_workspace/services/time-record/TimeRecordService'
import { TimeRecordApprovalResponse } from '@/_workspace/types/time-record/TimeRecordInterface'

export const PREFIX_QUERY_KEY_HR_CHECKER = 'TIME_RECORD_HR_CHECKER'

export const useTimeRecordSearchHrChecker = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<TimeRecordApprovalResponse[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY_HR_CHECKER, params],
    queryFn: () => TimeRecordService.searchHRChecker(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export const useTimeRecordCreateHrChecker = (onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
  return useMutation({
    mutationFn: (params: any) => TimeRecordService.createHrChecker(params),
    onSuccess,
    onError
  })
}

export const useTimeRecordSearchForExport = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<TimeRecordApprovalResponse[]>, Error>({
    queryKey: [`${PREFIX_QUERY_KEY_HR_CHECKER}_FOR_EXPORT`, params],
    queryFn: () => TimeRecordService.searchHrCheckerTableDataForExport(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export const useTimeRecordDeleteByHr = (onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
  return useMutation({
    mutationFn: (params: any) => TimeRecordService.deleteByHr(params),
    onSuccess,
    onError
  })
}
