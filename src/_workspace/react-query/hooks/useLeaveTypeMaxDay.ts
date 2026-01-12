import { keepPreviousData, useQuery } from '@tanstack/react-query'
import LeaveTypeMaxDayService from '@/_workspace/services/leave-type-max-day/LeaveTypeMaxDayService'
import { LeaveTypeMaxDayInterface } from '@/_workspace/types/leave-type-max-day/LeaveTypeMaxDayInterface'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'LEAVE_TYPE_MAX_DAY'

const useLeaveTypeMaxDay = (params: any = {}, isFetchData: boolean = true) =>
  useQuery<AxiosResponseI<LeaveTypeMaxDayInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => LeaveTypeMaxDayService.getLeaveTypeMaxDay(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export { useLeaveTypeMaxDay }
