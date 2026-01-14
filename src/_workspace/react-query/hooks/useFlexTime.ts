import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import FlexTimeService from '@/_workspace/services/flex-time/FlexTimeService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type {
  FlexTimeResponse,
  FlexTimeSearchParams,
  FlexTimeHistorySearchParams,
  FlexTimeApprovalSearchParams,
  FlexTimeCreatePayload,
  FlexTimeUpdatePayload,
  FlexTimeApprovalPayload,
  FlexTimeType,
  FlexTimeEmployeeDateParams,
  FlexTimeSpecificDateParams,
  FlexTimeUserParams,
  SubordinateFlexTimeSearchParams,
  SubordinateFlexTimeCalendarParams,
  UserFlexTimeUpdatePayload,
  UserFlexTimeDeletePayload
} from '@/_workspace/types/flex-time/FlexTimeInterface'

export const PREFIX_QUERY_KEY = 'FLEX_TIME'

export const useGetFlexTimeTypes = (enabled: boolean = true) => {
  return useQuery<AxiosResponseI<{ ResultOnDb: FlexTimeType[] }>>({
    queryKey: [`${PREFIX_QUERY_KEY}_TYPES`],
    queryFn: () => FlexTimeService.getFlexTime(),
    enabled,
    staleTime: 5 * 60 * 1000 // Cache 5 minutes
  })
}

export const useGetFlexTimeByEmployeeId = (params: FlexTimeEmployeeDateParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_CALENDAR`, params],
    queryFn: () => FlexTimeService.getAllByEmployeeId(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchFlexTimeHistory = (params: FlexTimeHistorySearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_HISTORY`, params],
    queryFn: () => FlexTimeService.searchFlexTimeHistory(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchFlexTimeApproval = (params: FlexTimeApprovalSearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_APPROVAL`, params],
    queryFn: () => FlexTimeService.searchForApprovalInFlow(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchFlexTimeBySpecificDate = (params: FlexTimeSpecificDateParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_DATE`, params],
    queryFn: () => FlexTimeService.searchFlexTimeBySpecificDate(params as any),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchFlexTimeHrChecker = (params: FlexTimeSearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_HR_CHECKER`, params],
    queryFn: () => FlexTimeService.searchHrCheckerTableData(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchUserFlexTime = (params: any, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_USER`, params],
    queryFn: () => FlexTimeService.searchUserFlexTime(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useCreateFlexTime = (
  onSuccess?: (data: AxiosResponseI<FlexTimeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: FlexTimeCreatePayload) => FlexTimeService.createFlexTime(dataItem),
    onSuccess,
    onError
  })
}

export const useUpdateFlexTime = (
  onSuccess?: (data: AxiosResponseI<FlexTimeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: FlexTimeUpdatePayload) => FlexTimeService.update(dataItem),
    onSuccess,
    onError
  })
}

export const useDeleteFlexTime = (
  onSuccess?: (data: AxiosResponseI<FlexTimeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: any) => FlexTimeService.deleteFlexTime(params),
    onSuccess,
    onError
  })
}

export const useCreateFlexTimeApproval = (
  onSuccess?: (data: AxiosResponseI<FlexTimeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: FlexTimeApprovalPayload) => FlexTimeService.createApproval(dataItem),
    onSuccess,
    onError
  })
}

export const useSearchFlexTimeApprover = (params: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: [`${PREFIX_QUERY_KEY}_APPROVER`, params],
    queryFn: () => FlexTimeService.searchHistoryApprover(params),
    enabled,
    staleTime: 0,
    gcTime: 0
  })
}

export const useSearchSubordinateFlexTime = (params: SubordinateFlexTimeSearchParams, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_SUBORDINATE`, params],
    queryFn: () => FlexTimeService.searchHistoryInFlowManager(params as any),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useGetSubordinateFlexTimeCalendarEvents = (
  params: SubordinateFlexTimeCalendarParams,
  enabled: boolean = true
) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_HR_CHECKER`, params],
    queryFn: () => FlexTimeService.searchHrChecker(params as any),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useSearchFlexTimeHrCheckerForExport = (params: FlexTimeSearchParams, enabled: boolean = false) => {
  return useQuery<AxiosResponseI<FlexTimeResponse>>({
    queryKey: [`${PREFIX_QUERY_KEY}_HR_CHECKER_EXPORT`, params],
    queryFn: () => FlexTimeService.searchHrCheckerTableDataForExport(params),
    placeholderData: keepPreviousData,
    enabled
  })
}

export const useUpdateUserFlexTime = (
  onSuccess?: (data: AxiosResponseI<FlexTimeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: UserFlexTimeUpdatePayload) => FlexTimeService.updateUserFlexTime(dataItem),
    onSuccess,
    onError
  })
}

export const useDeleteUserFlexTime = (
  onSuccess?: (data: AxiosResponseI<FlexTimeResponse>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: UserFlexTimeDeletePayload) => FlexTimeService.deleteFlexTime(params),
    onSuccess,
    onError
  })
}
