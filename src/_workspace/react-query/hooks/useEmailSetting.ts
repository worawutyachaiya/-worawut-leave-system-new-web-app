import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import EmailSettingService from '@/_workspace/services/email-setting/EmailSettingService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { EmailSettingInterface } from '@/_workspace/types/email-setting/EmailSettingInterface'

export const PREFIX_QUERY_KEY = 'EMAIL_SETTING'

export const useGetEmailSetting = (params: { EMPLOYEE_CODE: string }, enabled: boolean = true) => {
  return useQuery<AxiosResponseI<EmailSettingInterface>>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => EmailSettingService.get(params),
    placeholderData: keepPreviousData,
    enabled: enabled && !!params.EMPLOYEE_CODE
  })
}

export const useUpsertEmailSetting = (
  onSuccess?: (data: AxiosResponseI<any>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (dataItem: EmailSettingInterface) => EmailSettingService.upsert(dataItem),
    onSuccess,
    onError
  })
}
