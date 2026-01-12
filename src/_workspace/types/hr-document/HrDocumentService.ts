export interface SearchDocumentParams {
  LEAVE_REGULARITY_NAME?: string
  INUSE?: string
  Start?: string
  Limit?: string
  Order?: Array<{ id: string; desc: boolean }>
}
export interface CreateDocumentParams {
  LEAVE_REGULARITY_NAME: string
  LEAVE_TYPE_ID: string | number
  DESCRIPTION?: string
  CREATE_BY: string
  FILE_UPLOAD?: File
}
export interface DeleteDocumentParams {
  LEAVE_REGULARITY_ID: number | string
  UPDATE_BY: string
}
