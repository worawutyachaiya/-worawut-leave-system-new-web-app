export interface SearchLeaveTypeRegulationParams {
  LEAVE_TYPE?: string
  DEPARTMENT?: string
  INUSE?: string
  Start?: number
  Limit?: number
  Order?: Array<{ id: string; desc: boolean }>
}
export interface CreateLeaveTypeRegulationParams {
  LEAVE_TYPE_ID: number
  DEPARTMENT: string
  NUMBER_DAY: number
  CREATE_BY: string
}
export interface UpdateLeaveTypeRegulationParams {
  LEAVE_TYPE_REGULATION_ID: number
  NUMBER_DAY: number
  INUSE: string
  UPDATE_BY: string
}
export interface DeleteLeaveTypeRegulationParams {
  LEAVE_TYPE_REGULATION_ID: number
  UPDATE_BY: string
}
