import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import HrCheckerService from '@/_workspace/services/hr-checker/HrCheckerService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type {
  HrCheckerResponseData,
  HrCheckerSearchParams,
  HrCheckerUpdatePayload
} from '@/_workspace/types/hr-checker/HrCheckerInterface'

export const PREFIX_QUERY_KEY = 'HR_CHECKER'

export const useSearchHrChecker = (params: HrCheckerSearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<HrCheckerResponseData>>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => HrCheckerService.searchHrChecker(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchHrCheckerForExport = (params: HrCheckerSearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<HrCheckerResponseData>>({
    queryKey: [`${PREFIX_QUERY_KEY}_FOR_EXPORT`, params],
    queryFn: () => HrCheckerService.searchHrCheckerTableDataForExport(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useCreateHrChecker = (
  onSuccess?: (data: AxiosResponseI<HrCheckerResponseData>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: HrCheckerUpdatePayload) => HrCheckerService.createHrChecker(dataItem),
    onSuccess,
    onError
  })
}

export const useUpdateHrChecker = (
  onSuccess?: (data: AxiosResponseI<HrCheckerResponseData>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: HrCheckerUpdatePayload) => HrCheckerService.updateHrChecker(dataItem),
    onSuccess,
    onError
  })
}
