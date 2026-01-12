import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import leaveHistoryService from '@/_workspace/services/Leave-history/LeaveHistoryService'
import { LeaveHistoryInterface } from '@/_workspace/types/leave-history/LeaveHistoryInterface'

export const PREFIX_QUERY_KEY = 'LEAVE_HISTORY'

const useLeaveHistorySearch = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<LeaveHistoryInterface[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => leaveHistoryService.getHistory(params),
    placeholderData: keepPreviousData,
    //staleTime: 0,
    enabled: isFetchData
  })

export { useLeaveHistorySearch }
