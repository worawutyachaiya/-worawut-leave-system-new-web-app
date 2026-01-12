import { useQuery } from '@tanstack/react-query'
import ApproverService from '@/_workspace/services/time-record-approver/TimeRecordApprover'

export const useTimeRecordApprover = (params: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['EMPLOYEE_APPROVER', params],
    queryFn: () => ApproverService.searchApprover(params),
    enabled,
    staleTime: 0,
    gcTime: 0
  })
}

export const useSearchTimeRecordApprover = useTimeRecordApprover
