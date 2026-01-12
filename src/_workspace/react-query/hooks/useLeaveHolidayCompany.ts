import { keepPreviousData, useQuery } from '@tanstack/react-query'
import LeaveHolidayCompanyService from '@/_workspace/services/leave-holiday-company/LeaveHolidayCompanyService'
import { LeaveHolidayCompanyInterface } from '@/_workspace/types/leave-holiday-company/LeaveHolidayCompanyInterface'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'LEAVE_HOLIDAY_COMPANY'

interface UseLeaveHolidayCompanyParams {
  LEAVE_TYPE_DESCRIPTION?: string
  INUSE?: string
}

const useLeaveHolidayCompany = (params: UseLeaveHolidayCompanyParams = {}, isFetchData: boolean = true) =>
  useQuery<AxiosResponseI<LeaveHolidayCompanyInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => LeaveHolidayCompanyService.getAll(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export { useLeaveHolidayCompany }
