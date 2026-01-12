import { useQuery, useMutation } from '@tanstack/react-query'
import LeaveDocumentService from '@/_workspace/services/leave-document/LeaveDocumentService'
import type {
  LeaveDocumentAxiosResponse,
  LeaveDocumentDownloadParams,
  LeaveDocumentDownloadResponse,
  LeaveDocumentTabPaneParams
} from '@/_workspace/types/leave-document/LeaveDocumentInterface'

export const PREFIX_QUERY_KEY = 'LEAVE_DOCUMENT'

export const useGetLeaveDocuments = (
  onSuccess?: (data: LeaveDocumentAxiosResponse) => void,
  onError?: (error: Error) => void,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [PREFIX_QUERY_KEY, 'getAll'],
    queryFn: () => LeaveDocumentService.getAll(),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    select: data => {
      onSuccess?.(data)
      return data
    }
  })
}

export const useGetLeaveDocumentByTabPane = (
  params: LeaveDocumentTabPaneParams,
  onSuccess?: (data: LeaveDocumentDownloadResponse) => void,
  onError?: (error: Error) => void,
  enabled: boolean = true
) => {
  // console.log('useGetLeaveDocumentByTabPane params:', params)
  return useQuery({
    queryKey: [PREFIX_QUERY_KEY, 'tabPane', params.FILE_NAME],
    queryFn: () => LeaveDocumentService.getByTabPane(params),
    enabled: enabled && !!params.FILE_NAME,
    staleTime: Infinity
  })
}

export const useDownloadLeaveDocument = (
  onSuccess?: (data: LeaveDocumentDownloadResponse) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: LeaveDocumentDownloadParams) => LeaveDocumentService.downloadRegularity(params),
    onSuccess,
    onError
  })
}

export const downloadBlobAsFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
