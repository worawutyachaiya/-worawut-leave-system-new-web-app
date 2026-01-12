import { useMutation } from '@tanstack/react-query'
import LeaveHistoryService, { DeleteLeaveParams } from '@/_workspace/services/Leave-history/LeaveHistoryService'

export const PREFIX_QUERY_KEY = 'LEAVE_HISTORY'

export const useDeleteLeave = (onSuccess?: (data: any) => void, onError?: (error: any) => void) => {
  return useMutation({
    mutationFn: (params: DeleteLeaveParams) => LeaveHistoryService.deleteLeave(params),
    onSuccess,
    onError
  })
}
