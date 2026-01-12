import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import HrEditService from '@/_workspace/services/hr-edit/HrEditService'
import {
  SearchEmployeeProbationParams,
  UserProbationInterface,
  SetPassProParams
} from '@/_workspace/types/hr-user-probation/HrUserProbation'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'hr-search-probation'

export const useSearchEmployeeProbation = (params: SearchEmployeeProbationParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<UserProbationInterface>>({
    queryKey: [PREFIX_QUERY_KEY, 'search-employee-probation', params],
    queryFn: () => HrEditService.searchEmployeeProbation(params),
    enabled
  })
}

export const useSetPassPro = (onSuccess?: (data: AxiosResponseI<any>) => void, onError?: (error: Error) => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: SetPassProParams) => HrEditService.setPassPro(params),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      onSuccess?.(data)
    },
    onError
  })
}
