import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import HrCheckerM75Service from '@/_workspace/services/hr-checker-m75/HrCheckerM75Service'
import type { HrCheckerM75ResponseI, HrCheckerM75SearchParams } from '@/_workspace/types/hr-checker-m75/HrCheckerM75Interface'

export const PREFIX_QUERY_KEY_HR_CHECK_M75 = 'HR_CHECK_M75'

interface HrCheckerM75Payload {
    rowAction: Array<{
        LEAVE_REQUEST_ID: string
        TYPE: string
    }>
    approvalBy: string
    totalCount?: number
}

const useSearchHrChecker = (params: HrCheckerM75SearchParams, isFetchData: boolean) =>
    useQuery<AxiosResponseI<HrCheckerM75ResponseI>, Error>({
        queryKey: [PREFIX_QUERY_KEY_HR_CHECK_M75, params],
        queryFn: () => HrCheckerM75Service.searchHrCheckerM75(params),
        placeholderData: keepPreviousData,
        enabled: isFetchData
    })

export const useCreateHrCheckerM75 = (
    onSuccess?: (data: any) => void,
    onError?: (error: Error) => void
) => {
    return useMutation({
        mutationFn: (payload: HrCheckerM75Payload) => HrCheckerM75Service.createHrCheckerM75(payload),
        onSuccess,
        onError
    })
}

// Hook for export - fetches all data without pagination
export const useSearchHrCheckerExport = (params: Omit<HrCheckerM75SearchParams, 'Start' | 'Limit' | 'Order'>, enabled: boolean) =>
    useQuery<AxiosResponseI<HrCheckerM75ResponseI>, Error>({
        queryKey: ['HR_CHECK_M75_EXPORT', params],
        queryFn: () => HrCheckerM75Service.searchHrCheckerM75({
            ...params,
            Start: 0,
            Limit: 99999 // Fetch all for export
        }),
        placeholderData: keepPreviousData,
        enabled
    })

export { useSearchHrChecker }

