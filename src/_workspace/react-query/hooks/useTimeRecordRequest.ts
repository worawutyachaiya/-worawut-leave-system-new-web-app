import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import TimeRecordService from '@/_workspace/services/time-record/TimeRecordService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type {
  TimeRecordResponse,
  TimeRecordRequestCreatePayload,
  TimeRecordSearchParams,
  TimeRecordTypeI
} from '@/_workspace/types/time-record/TimeRecordInterface'

export const PREFIX_QUERY_KEY = 'TIME_RECORD'

export const useCreateTimeRecord = (
  onSuccess?: (data: AxiosResponseI<TimeRecordResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: TimeRecordRequestCreatePayload) => TimeRecordService.create(dataItem),
    onSuccess,
    onError
  })
}

export const useGetTimeRecordTypes = (enabled: boolean = true) => {
  return useQuery<AxiosResponseI<{ ResultOnDb: TimeRecordTypeI[] }>>({
    queryKey: [`${PREFIX_QUERY_KEY}_TYPES`],
    queryFn: () => TimeRecordService.searchTimeRecordType(),
    enabled,
    staleTime: 5 * 60 * 1000 // Cache 5 minutes
  })
}

export const useSearchTimeRecord = (params: TimeRecordSearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<TimeRecordResponse>>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => TimeRecordService.search(params),
    enabled,
    placeholderData: keepPreviousData
  })
}
