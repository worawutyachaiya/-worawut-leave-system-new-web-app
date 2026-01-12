import { useMutation } from '@tanstack/react-query'
import LeaveFileService from '@/_workspace/services/leave-file/LeaveFileService'
import type {
  LeaveFileAxiosResponse,
  LeaveFileDownloadResponse,
  LeaveFileDownloadParams
} from '@/_workspace/types/leave-file/LeaveFileInterface'

export const PREFIX_QUERY_KEY = 'LEAVE_FILE'

export const useUploadLeaveFile = (
  onSuccess?: (data: LeaveFileAxiosResponse) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (formData: FormData) => LeaveFileService.uploadFile(formData),
    onSuccess,
    onError
  })
}

export const useUploadNewLeaveFile = (
  onSuccess?: (data: LeaveFileAxiosResponse) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (formData: FormData) => LeaveFileService.uploadNewFile(formData),
    onSuccess,
    onError
  })
}

export const useDownloadLeaveFile = (
  onSuccess?: (data: LeaveFileDownloadResponse) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: LeaveFileDownloadParams) => LeaveFileService.downloadFile(params),
    onSuccess,
    onError
  })
}

export const useDeleteLeaveFile = (
  onSuccess?: (data: LeaveFileAxiosResponse) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: (params: object) => LeaveFileService.deleteFile(params),
    onSuccess,
    onError
  })
}

export const createLeaveFileFormData = (params: {
  leaveRequestId: string
  leaveFileUploadId: string
  file: File | null
  employeeCode: string
  reason: string
  remark: string
}): FormData => {
  const formData = new FormData()

  formData.append('LEAVE_REQUEST_ID', params.leaveRequestId)
  formData.append('LEAVE_REQUEST_FILE_UPLOAD_ID', params.leaveFileUploadId)
  formData.append('FILE_UPLOAD', params.file || '')
  formData.append('EMPLOYEE_CODE', params.employeeCode)

  if (params.reason) {
    formData.append('REASON', params.reason)
  }

  if (params.remark) {
    formData.append('REMARK', params.remark)
  }

  return formData
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
