export interface LeaveDocumentData {
  LEAVE_REGULARITY_ID: number
  LEAVE_REGULARITY_NAME: string
  LEAVE_REGULARITY_FILE_NAME: string
}
export interface LeaveDocumentResponse {
  Status: boolean
  Message: string
  MessageWarning?: boolean
  ResultOnDb: LeaveDocumentData[]
  ResultFiles?: LeaveDocumentFile[]
}
export interface LeaveDocumentFile {
  name: string
}
export interface LeaveDocumentDownloadParams {
  FILE_NAME: string
}
export interface LeaveDocumentTabPaneParams {
  FILE_NAME: string
}
export interface LeaveDocumentAxiosResponse {
  data: LeaveDocumentResponse
  status: number
  statusText: string
}
export interface LeaveDocumentDownloadResponse {
  data: Blob
  status: number
  statusText: string
}
