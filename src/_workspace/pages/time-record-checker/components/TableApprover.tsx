import { useMemo } from 'react'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useSettings } from '@/@core/hooks/useSettings'
import { useSearchTimeRecordApprover } from '@/_workspace/react-query/hooks/useTimeRecordApprover'

interface TimeRecordData {
  TIME_RECORD_REQUEST_ID?: number
  APPROVER?: string[]
  IS_APPROVED?: number
  [key: string]: any
}

interface TableApproverProps {
  row: TimeRecordData
}

interface ApproverItem {
  APPROVER_ID: string
  APPROVAL_STATUS_ID: number | string
}

const TableApprover: React.FC<TableApproverProps> = ({ row }) => {
  const { settings } = useSettings()
  const params = useMemo(
    () => ({
      TIME_RECORD_REQUEST_ID: row?.TIME_RECORD_REQUEST_ID || 0
    }),
    [row?.TIME_RECORD_REQUEST_ID]
  )
  const approverList = row?.APPROVER || []
  const shouldFetch = !!row?.TIME_RECORD_REQUEST_ID && approverList.length > 0
  const { data, isLoading, isError } = useSearchTimeRecordApprover(params, shouldFetch)

  const result = useMemo<ApproverItem[]>(() => {
    const resultArray: ApproverItem[] = []
    const apiData = data?.data?.ResultOnDb || []

    if (Array.isArray(approverList) && approverList.length > 0) {
      approverList.forEach((elem: any) => {
        const approverId = typeof elem === 'string' ? elem : elem?.APPROVER_ID || elem
        let statusId: number | string = 0

        apiData.forEach((apiItem: any) => {
          if (approverId?.toString().toLowerCase() === apiItem.APPROVAL_BY_APPROVER_EMPLOYEE_CODE?.toLowerCase()) {
            statusId = apiItem.APPROVAL_STATUS_ID
          }
        })

        resultArray.push({
          APPROVER_ID: String(approverId),
          APPROVAL_STATUS_ID: statusId
        })
      })
    }

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
      {result.map(({ APPROVER_ID, APPROVAL_STATUS_ID }, index) => (
        <Box
          component='li'
          key={`${APPROVER_ID}-${APPROVAL_STATUS_ID}-${index}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.25,
            fontSize: '0.875rem'
          }}
        >
          {getStatusChip(APPROVAL_STATUS_ID)}
          <span style={{ margin: '0 4px' }}>:</span>
          <span>{APPROVER_ID}</span>
        </Box>
      ))}
    </Box>
  )
}

export default TableApprover
