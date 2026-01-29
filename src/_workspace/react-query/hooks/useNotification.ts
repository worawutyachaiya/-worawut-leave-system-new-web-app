import { keepPreviousData, useQuery } from '@tanstack/react-query'
import NotificationService from '@/_workspace/services/notification/NotificationService'
import { NotificationInterface } from '@/_workspace/types/notification/NotificationInterface'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'NOTIFICATION'

const useNotification = (params: any, isFetchData: boolean = true) =>
  useQuery<AxiosResponseI<NotificationInterface[]>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => NotificationService.getNotification(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData
  })

export { useNotification }
