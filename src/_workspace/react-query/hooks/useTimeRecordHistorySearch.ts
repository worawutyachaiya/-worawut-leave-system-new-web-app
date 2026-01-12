import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import TimeRecordService from '@/_workspace/services/time-record/TimeRecordService'
import { TimeRecordHistoryInterface, DeleteTimeRecordParams } from '@/_workspace/types/time-record/TimeRecordInterface'

export const PREFIX_QUERY_KEY = 'TIME_RECORD_HISTORY'
export const CHECK_SUBORDINATE_PREFIX_QUERY_KEY = 'CHECK_SUBORDINATE_TIME_RECORD'

const useTimeRecordHistorySearch = (params: any, enabled: boolean = true) =>
  useQuery<AxiosResponseI<TimeRecordHistoryInterface[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => TimeRecordService.search(params),
    placeholderData: keepPreviousData,
    enabled
  })

export const useCheckSubordinateTimeRecordSearch = (params: any, enabled: boolean = true) =>
  useQuery<AxiosResponseI<any>, Error>({
    queryKey: [CHECK_SUBORDINATE_PREFIX_QUERY_KEY, params],
    queryFn: () => TimeRecordService.searchCheckSubordinateTimeRecord(params),
    placeholderData: keepPreviousData,
    enabled
  })

export const useDeleteTimeRecord = (onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
  return useMutation({
    mutationFn: (params: DeleteTimeRecordParams) => TimeRecordService.deleteTimeRecord(params),
    onSuccess,
    onError
  })
}

export { useTimeRecordHistorySearch }
