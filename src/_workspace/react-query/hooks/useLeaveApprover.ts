import { useQuery } from '@tanstack/react-query'
import ApproverService, { SearchApproverParams } from '@/_workspace/services/leave-approver/ApproverService'

// Search Approver
export const useSearchApprover = (params: SearchApproverParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['EMPLOYEE_APPROVER', params],
    queryFn: () => ApproverService.searchApprover(params),
    enabled,
    staleTime: 0,
    gcTime: 0
  })
}
