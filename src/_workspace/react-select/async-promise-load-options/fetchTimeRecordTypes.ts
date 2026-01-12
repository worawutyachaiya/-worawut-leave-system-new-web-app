import TimeRecordService from '@/_workspace/services/time-record/TimeRecordService'
import type { TimeRecordTypeI } from '@/_workspace/types/time-record/TimeRecordInterface'

export const fetchTimeRecordTypes = async (): Promise<TimeRecordTypeI[]> => {
  try {
    const response = await TimeRecordService.searchTimeRecordType()
    return response?.data?.ResultOnDb || []
  } catch (error) {
    console.error('Error fetching time record types:', error)
    return []
  }
}
