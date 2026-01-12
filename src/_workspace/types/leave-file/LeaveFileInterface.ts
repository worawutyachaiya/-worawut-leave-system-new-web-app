export interface LeaveFileResponse {
  Status: boolean
  Message: string
  MessageWarning?: boolean
  ResultOnDb?: LeaveFileData[]
}
export interface LeaveFileData {
  LEAVE_REQUEST_ID: string
  LEAVE_REQUEST_FILE_UPLOAD_ID: number
  LEAVE_REQUEST_FILE_UPLOAD_NAME: string
  LEAVE_REQUEST_FILE_UPLOAD_PATH: string
  CREATE_DATE?: string
  UPDATE_DATE?: string
}
export interface LeaveFileUploadParams {
  LEAVE_REQUEST_ID: number | string
  LEAVE_REQUEST_FILE_UPLOAD_ID: number
  FILE_UPLOAD: File | null
  EMPLOYEE_CODE: string
  REASON?: string
  REMARK?: string
}
export interface LeaveFileDownloadParams {
  FILE_NAME: string
  FILE_PATH: string
}
export interface LeaveFileDeleteParams {
  LEAVE_REQUEST_ID: string
  LEAVE_REQUEST_FILE_UPLOAD_ID?: number
}
export interface LeaveFileAxiosResponse {
  data: LeaveFileResponse
  status: number
  statusText: string
}
export interface LeaveFileDownloadResponse {
  data: Blob
  status: number
  statusText: string
}
