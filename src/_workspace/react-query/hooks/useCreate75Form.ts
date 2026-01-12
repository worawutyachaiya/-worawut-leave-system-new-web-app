import { useMutation } from '@tanstack/react-query'
import axiosRequest_LeaveSystem from '@/_workspace/axios/leave-system/axiosRequest_LeaveSystem'
import HrM75FormAPI from '@/_workspace/api/hr-m75-form/HrM75FormAPI'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { Create75FormParams, Create75FormResponse } from '@/_workspace/types/hr-m75-form/HrM75FormInterface'

export const PREFIX_QUERY_KEY = 'M75_FORM'

export const useCreate75Form = (
  onSuccess?: (data: AxiosResponseI<Create75FormResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation<AxiosResponseI<Create75FormResponse>, Error, Create75FormParams>({
    mutationFn: async (dataItem: Create75FormParams) => {
      return await axiosRequest_LeaveSystem({
        url: `${HrM75FormAPI.API_ROOT_URL}/create75Form`,
        method: 'POST',
        data: dataItem
      })
    },
    onSuccess,
    onError
  })
}
