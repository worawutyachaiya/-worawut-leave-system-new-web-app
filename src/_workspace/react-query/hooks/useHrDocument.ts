import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import HrDocumentService from '@/_workspace/services/hr-document/HrDocumentService'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { DocumentInterface } from '@/_workspace/types/hr-document/HrDocument'
import type {
  SearchDocumentParams,
  CreateDocumentParams,
  DeleteDocumentParams
} from '@/_workspace/types/hr-document/HrDocumentService'

export const PREFIX_QUERY_KEY = 'HR_SETTING_DOCUMENT'

export const useSearchDocument = (params: SearchDocumentParams, enabled: boolean = true) =>
  useQuery<AxiosResponseI<{ ResultOnDb: DocumentInterface[]; TotalCountOnDb: number }>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => HrDocumentService.searchDocument(params),
    placeholderData: keepPreviousData,
    enabled
  })

export const useCreateDocument = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (formData: FormData) => HrDocumentService.createDocument(formData),
    onSuccess,
    onError
  })
}

export const useDeleteDocument = (
  onSuccess?: (data: AxiosResponseI<{ ResultOnDb: any }>) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: DeleteDocumentParams) => HrDocumentService.deleteDocument(params),
    onSuccess,
    onError
  })
}
