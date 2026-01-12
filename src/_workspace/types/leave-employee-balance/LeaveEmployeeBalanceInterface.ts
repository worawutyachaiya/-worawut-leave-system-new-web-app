export interface LeaveEmployeeBalanceInterface {
  LEAVE_TYPE_ID: number
  LEAVE_TYPE_DESCRIPTION_EN: string
  LEAVE_TYPE_DESCRIPTION_TH: string
  LEAVE_REMAIN_DAY: number      
  QTY_DAY: number               
  USED_DAY: number              
  EMPLOYEE_CODE: string
  EMPLOYEE_START_WORK: string   
  IS_PASS_PRO: boolean          
}
export const LEAVE_TYPE_IDS = {
  ANNUAL_LEAVE: 1,              
  BUSINESS_LEAVE: 3,            
  M2L: 6,                       
  SICK_LEAVE: 9,                
  WFH: 11,                      
  ANNUAL_LEAVE_EMERGENCY: 12,   
  OTHER_LEAVE: 13,              
  RECEIVED_DAY: 16,             
  ANNUAL_LEAVE_ACCUMULATE: 21,
  FUNERAL_LEAVE: 4,             
} as const
