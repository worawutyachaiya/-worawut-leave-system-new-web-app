import { useQuery, useMutation } from '@tanstack/react-query'
import UserLeaveService from '@/_workspace/services/hr-user-leave/UserLeaveService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { UserLeaveInterface } from '@/_workspace/types/hr-user-leave/HrUserLeave'
import type {
  SearchUserLeaveParams,
  UpdateUserLeaveParams,
  DeleteUserLeaveParams
} from '@/_workspace/types/hr-user-leave/HrUserLeaveService'

export const PREFIX_QUERY_KEY = 'hr-user-leave'

export const useSearchUserLeave = (params: SearchUserLeaveParams) => {
  return useQuery<AxiosResponseI<any[]>>({
    queryKey: [PREFIX_QUERY_KEY, 'search', params],
    queryFn: () => UserLeaveService.searchUserLeave(params),
    enabled: false
  })
}

export const useUpdateUserLeave = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: UserLeaveInterface }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: UpdateUserLeaveParams) => UserLeaveService.updateUserLeave(params),
    onSuccess,
    onError
  })
}

export const useDeleteUserLeave = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: DeleteUserLeaveParams) => UserLeaveService.deleteUserLeave(params),
    onSuccess,
    onError
  })
}
