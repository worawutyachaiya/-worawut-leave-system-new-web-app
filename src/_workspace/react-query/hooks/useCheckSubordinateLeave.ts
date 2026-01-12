import { useQuery } from '@tanstack/react-query'
import { CheckSubordinateLeaveService } from '@/_workspace/services/check-subordinate-leave/CheckSubordinateLeaveService'

export const PREFIX_QUERY_KEY = 'CHECK_SUBORDINATE_LEAVE'
export const PREFIX_QUERY_KEY_TABLE_SEARCH = 'CHECK_SUBORDINATE_LEAVE_TABLE'

export const useCheckSubordinateLeaveSearch = (params: any, isFetchData: boolean) =>
  useQuery({
    queryKey: [PREFIX_QUERY_KEY_TABLE_SEARCH, params],
    queryFn: () => CheckSubordinateLeaveService.searchSubordinateLeave(params),
    enabled: isFetchData,
    placeholderData: previousData => previousData
  })

export const useGetCalendarEvents = (
  params: {
    START_DATE: string
    END_DATE: string
    EMPLOYEE_ID_REQUEST: string
    EMPLOYEE_CODE?: string
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [PREFIX_QUERY_KEY, 'events', params],
    queryFn: () => CheckSubordinateLeaveService.getEvents(params),
    enabled: enabled,
    staleTime: 5 * 60 * 1000
  })
}

export const useGetCalendarEventsByDate = (
  params: {
    TARGET_DATE: string
    EMPLOYEE_ID_REQUEST: string
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [PREFIX_QUERY_KEY, 'events-by-date', params],
    queryFn: () => CheckSubordinateLeaveService.getEventsByDate(params),
    enabled: enabled
  })
}

export const useGetEmployeeLeaveUsage = (
  params: { EMPLOYEE_CODE: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [PREFIX_QUERY_KEY, 'employee-leave-usage', params],
    queryFn: () => CheckSubordinateLeaveService.getEmployeeLeaveUsage(params),
    enabled: enabled,
    staleTime: 5 * 60 * 1000
  })
}
