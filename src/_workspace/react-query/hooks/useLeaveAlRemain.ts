import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import LeaveService from '@/_workspace/services/leave-al-remain/LeaveAlRemainService'
import { LeaveAlRemainInterface } from '@/_workspace/types/leave-employee-information/LeaveEmployeeInformationInterface'

export const PREFIX_QUERY_KEY = 'AL_REMAIN'

const useSearchRemainALInFlow = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<LeaveAlRemainInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => LeaveService.searchRemainALInFlow(params),
    placeholderData: keepPreviousData,
    //staleTime: 0,
    enabled: isFetchData
  })

export { useSearchRemainALInFlow }
