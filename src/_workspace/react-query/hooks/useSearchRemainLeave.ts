import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import RemainLeaveService from '@/_workspace/services/remain-leave/RemainLeaveService'
import type { RemainLeaveInterface } from '@/_workspace/types/remain-leave/RemainLeaveInterface'

export const PREFIX_QUERY_KEY_REMAIN_LEAVE = 'REMAIN_LEAVE'
const useRemainLeaveSearch = (params: any, isFetchData: boolean) =>
  useQuery<AxiosResponseI<RemainLeaveInterface[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY_REMAIN_LEAVE, params],
    queryFn: () => RemainLeaveService.getRemainLeave(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export interface UpdateRemainLeaveParams {
  EMPLOYEE_CODE: string
  LEAVE_TYPE_ID: number
  LEAVE_REMAIN_DAY: number
  UPDATE_BY: string
}

const useUpdateRemainLeave = (onSuccess?: (data: AxiosResponseI<any>) => void, onError?: (error: Error) => void) => {
  return useMutation({
    mutationFn: (params: UpdateRemainLeaveParams) => RemainLeaveService.updateRemainLeave(params),
    onSuccess,
    onError
  })
}

export { useRemainLeaveSearch, useUpdateRemainLeave }
