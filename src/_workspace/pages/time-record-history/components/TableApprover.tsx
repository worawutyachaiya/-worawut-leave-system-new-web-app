import { useMemo } from 'react'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTimeRecordApprover } from '@/_workspace/react-query/hooks/useTimeRecordApprover'
import { useSettings } from '@/@core/hooks/useSettings'
import { TimeRecordHistoryInterface } from '@/_workspace/types/time-record/TimeRecordInterface'
interface TableApproverProps {
  row: TimeRecordHistoryInterface
}
interface ApproverItem {
  TIME_RECORD_APPROVAL_BY: string
  TIME_RECORD_APPROVAL_STATUS: number | string
}
const TableApprover: React.FC<TableApproverProps> = ({ row }) => {
  const { settings } = useSettings()
  const params = useMemo(() => ({
    TIME_RECORD_REQUEST_ID: row?.TIME_RECORD_REQUEST_ID || '',
  }), [row?.TIME_RECORD_REQUEST_ID])
  const approverList = row?.APPROVER || []
  const shouldFetch = !!row?.TIME_RECORD_REQUEST_ID && approverList.length >= 0
  const { data, isLoading, isError } = useTimeRecordApprover(params, shouldFetch)
  const result = useMemo<ApproverItem[]>(() => {
    const resultArray: ApproverItem[] = []
    const apiData = data?.data?.ResultOnDb || []
    if ((row as any)?.IS_APPROVED === 0 || (row as any)?.IS_APPROVED === '0') {
      if (Array.isArray(approverList)) {
        approverList.forEach((elem: any) => {
          const approverId = typeof elem === 'string' ? elem : elem?.APPROVER_ID || elem
          resultArray.push({
            TIME_RECORD_APPROVAL_BY: String(approverId),
            TIME_RECORD_APPROVAL_STATUS: 0
          })
        })
      }
    } else {
      apiData.forEach((elem: any) => {
        resultArray.push({
          TIME_RECORD_APPROVAL_BY: elem.TIME_RECORD_APPROVAL_BY,
          TIME_RECORD_APPROVAL_STATUS: elem.TIME_RECORD_APPROVAL_STATUS  
        })
      })
    }
    resultArray.forEach((el) => {
      apiData.forEach((apiItem: any) => {
        if (el.TIME_RECORD_APPROVAL_BY.toString().toLowerCase() === apiItem.TIME_RECORD_APPROVAL_BY?.toLowerCase()) {
          el.TIME_RECORD_APPROVAL_STATUS = apiItem.TIME_RECORD_APPROVAL_STATUS
        }
      })
    })
    return resultArray
  }, [row, approverList, data?.data?.ResultOnDb])
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <CircularProgress size={20} />
      </Box>
    )
  }
  if (isError) {
    return <span className='text-error'>Error loading approvers</span>
  }
  if (result.length === 0) {
    return <span className='text-secondary'>-</span>
  }
  const getStatusChip = (statusId: number | string) => {
    const status = String(statusId)
    if (status === '1') {
      return (
        <Chip
          size='small'
          label='✓'
          color='success'
          variant={settings.mode === 'dark' ? 'outlined' : 'filled'}
          sx={{ height: 20, fontSize: 12, mr: 0.5 }}
        />
      )
    }
    if (status === '2') {
      return (
        <Chip
          size='small'
          label='✗'
          color='error'
          variant={settings.mode === 'dark' ? 'outlined' : 'filled'}
          sx={{ height: 20, fontSize: 12, mr: 0.5 }}
        />
      )
    }
    return (
      <Chip
        size='small'
        label='✓'
        color='default'
        variant='outlined'
        sx={{ height: 20, fontSize: 12, mr: 0.5, opacity: 0.6 }}
      />
    )
  }
  return (
    <Box component='ol' sx={{ m: 0, pl: 2 }}>
      {result.map(({ TIME_RECORD_APPROVAL_BY, TIME_RECORD_APPROVAL_STATUS }, index) => (
        <Box
          component='li'
          key={`${TIME_RECORD_APPROVAL_BY}-${TIME_RECORD_APPROVAL_STATUS}-${index}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.25,
            fontSize: '0.875rem'
          }}
        >
          {getStatusChip(TIME_RECORD_APPROVAL_STATUS)}
          <span style={{ margin: '0 4px' }}>:</span>
          <span>{TIME_RECORD_APPROVAL_BY}</span>
        </Box>
      ))}
    </Box>
  )
}
export default TableApprover
