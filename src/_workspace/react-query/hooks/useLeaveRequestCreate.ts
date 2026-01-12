import { useMutation } from '@tanstack/react-query'
import LeaveRequestService from '@/_workspace/services/leave-request/LeaveRequestService'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type {
  LeaveRequestResponseData,
  LeaveRequestCreatePayload
} from '@/_workspace/types/leave-request/LeaveRequestInterface'

export const PREFIX_QUERY_KEY = 'LEAVE_REQUEST'

export const useCreateLeaveRequest = (
  onSuccess?: (data: AxiosResponseI<LeaveRequestResponseData>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: LeaveRequestCreatePayload) => LeaveRequestService.create(dataItem),
    onSuccess,
    onError
  })
}
