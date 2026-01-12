import { keepPreviousData, useQuery } from '@tanstack/react-query'
import EmployeeLeaveBalanceService from '@/_workspace/services/leave-employee-balance/EmployeeLeaveBalanceService'
import { LeaveEmployeeBalanceInterface } from '@/_workspace/types/leave-employee-balance/LeaveEmployeeBalanceInterface'
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

export const PREFIX_QUERY_KEY = 'EMPLOYEE_LEAVE_BALANCE'

interface UseEmployeeLeaveBalanceParams {
  EMPLOYEE_CODE?: string
}

const useLeaveEmployeeBalance = (params: UseEmployeeLeaveBalanceParams, isFetchData: boolean = true) =>
  useQuery<AxiosResponseI<LeaveEmployeeBalanceInterface>, Error>({
    queryKey: [PREFIX_QUERY_KEY, params],
    queryFn: () => EmployeeLeaveBalanceService.search(params),
    placeholderData: keepPreviousData,
    enabled: isFetchData && !!params.EMPLOYEE_CODE
  })

const getLeaveBalance = (
  data: AxiosResponseI<LeaveEmployeeBalanceInterface> | undefined,
  leaveTypeId: number
): LeaveEmployeeBalanceInterface | undefined => {
  return data?.data?.ResultOnDb?.find(item => item.LEAVE_TYPE_ID === leaveTypeId)
}

const getRemainDayByLeaveType = (
  data: AxiosResponseI<LeaveEmployeeBalanceInterface> | undefined,
  leaveTypeId: number
): number => {
  const found = data?.data?.ResultOnDb?.find(item => item.LEAVE_TYPE_ID === leaveTypeId)
  return found?.LEAVE_REMAIN_DAY ?? 0
}

const getUsedDayByLeaveType = (
  data: AxiosResponseI<LeaveEmployeeBalanceInterface> | undefined,
  leaveTypeId: number
): number => {
  const found = data?.data?.ResultOnDb?.find(item => item.LEAVE_TYPE_ID === leaveTypeId)
  // USED_DAY = QTY_DAY - LEAVE_REMAIN_DAY (คำนวณจาก backend)
  // console.log(found?.USED_DAY);
  return found?.USED_DAY ?? 0
}

export { useLeaveEmployeeBalance, getLeaveBalance, getRemainDayByLeaveType, getUsedDayByLeaveType }
