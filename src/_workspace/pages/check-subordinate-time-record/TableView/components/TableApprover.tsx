import { useMemo } from 'react'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useSearchTimeRecordApprover } from '@/_workspace/react-query/hooks/useTimeRecordApprover'
import { useSettings } from '@/@core/hooks/useSettings'
import type { CheckSubordinateTimeRecord } from '@/_workspace/types/check-subordinate-time-record/CheckSubordinateTimeRecordTypes'

interface TableApproverProps {
  row: CheckSubordinateTimeRecord
}

interface ApproverItem {
  APPROVER_ID: string
  APPROVAL_STATUS_ID: number | string
}

const TableApprover: React.FC<TableApproverProps> = ({ row }) => {
  const { settings } = useSettings()

  const approverList = useMemo(() => {
    const list: string[] = []
    if (row?.approveNo1) list.push(row.approveNo1)
    if (row?.approveNo2) list.push(row.approveNo2)
    if (row?.approveNo3) list.push(row.approveNo3)
    if (row?.approveNo4) list.push(row.approveNo4)
    if (row?.approveNo5) list.push(row.approveNo5)
    return list
  }, [row])

  const params = useMemo(
    () => ({
      TIME_RECORD_REQUEST_ID: row?.TIME_RECORD_REQUEST_ID || ''
    }),
    [row?.TIME_RECORD_REQUEST_ID]
  )

  const shouldFetch = !!row?.TIME_RECORD_REQUEST_ID && approverList.length > 0
  const { data, isLoading, isError } = useSearchTimeRecordApprover(params, shouldFetch)

  const result = useMemo<ApproverItem[]>(() => {
    const resultArray: ApproverItem[] = []
    const apiData = data?.data?.ResultOnDb || []

    approverList.forEach(approverId => {
      resultArray.push({
        APPROVER_ID: approverId,
        APPROVAL_STATUS_ID: 0
      })
    })

    resultArray.forEach(el => {
      apiData.forEach((apiItem: any) => {
        if (el.APPROVER_ID.toString().toLowerCase() === apiItem.APPROVAL_BY_APPROVER_EMPLOYEE_CODE?.toLowerCase()) {
          el.APPROVAL_STATUS_ID = apiItem.APPROVAL_STATUS_ID
        }
      })
    })

    return resultArray
  }, [approverList, data?.data?.ResultOnDb])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <CircularProgress size={20} />
      </Box>
    )
  }

  if (isError) {
    return <span className='text-error'>Error</span>
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
          <span style={{ margin: '0 4px' }}></span>
          <span>{APPROVER_ID}</span>
        </Box>
      ))}
    </Box>
  )
}

export default TableApprover
