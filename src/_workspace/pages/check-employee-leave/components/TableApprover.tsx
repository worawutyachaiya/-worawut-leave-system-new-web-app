import { useMemo } from 'react'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useSearchApprover } from '@/_workspace/react-query/hooks/useLeaveApprover'
import { useSearchFlexTimeApprover } from '@/_workspace/react-query/hooks/useFlexTime'
import { useSettings } from '@/@core/hooks/useSettings'
import { HrCheckerResponseData } from '@/_workspace/types/hr-checker/HrCheckerInterface'

interface TableApproverProps {
  row: HrCheckerResponseData
}

interface ApproverItem {
  APPROVER_ID: string
  APPROVAL_STATUS_ID: number | string
}

const TableApprover: React.FC<TableApproverProps> = ({ row }) => {
  const { settings } = useSettings()
  const rowType = (row as any)?.TYPE || 'LEAVE'
  const isFlexTime = rowType === 'FLEX_TIME'

  const leaveParams = useMemo(
    () => ({
      LEAVE_REQUEST_ID: row?.LEAVE_REQUEST_ID,
      TYPE: rowType
    }),
    [row?.LEAVE_REQUEST_ID, rowType]
  )

  const flexTimeParams = useMemo(
    () => ({
      FLEX_TIME_REQUEST_ID: row?.LEAVE_REQUEST_ID
    }),
    [row?.LEAVE_REQUEST_ID]
  )

  const approverList = row?.APPROVER
  const shouldFetch = !!row?.LEAVE_REQUEST_ID && approverList.length >= 0

  const leaveApproverQuery = useSearchApprover(leaveParams, shouldFetch && !isFlexTime)
  const flexTimeApproverQuery = useSearchFlexTimeApprover(flexTimeParams, shouldFetch && isFlexTime)

  const { data, isLoading, isError } = isFlexTime ? flexTimeApproverQuery : leaveApproverQuery

  const result = useMemo<ApproverItem[]>(() => {
    const resultArray: ApproverItem[] = []
    const apiData = (data as any)?.data?.ResultOnDb || []

    if ((row as any)?.IS_APPROVED === 0 || (row as any)?.IS_APPROVED === '0') {
      if (Array.isArray(approverList)) {
        approverList.forEach((elem: any) => {
          const approverId = typeof elem === 'string' ? elem : elem?.APPROVER_ID || elem
          resultArray.push({
            APPROVER_ID: String(approverId),
            APPROVAL_STATUS_ID: 0
          })
        })
      }
    } else {
      apiData.forEach((elem: any) => {
        const approverId = isFlexTime
          ? elem.FLEX_TIME_APPROVAL_BY || elem.APPROVAL_BY_APPROVER_EMPLOYEE_CODE
          : elem.APPROVAL_BY_APPROVER_EMPLOYEE_CODE
        const statusId = isFlexTime
          ? elem.FLEX_TIME_APPROVAL_STATUS || elem.APPROVAL_STATUS_ID
          : elem.APPROVAL_STATUS_ID

        resultArray.push({
          APPROVER_ID: approverId,
          APPROVAL_STATUS_ID: statusId
        })
      })
    }

    resultArray.forEach(el => {
      apiData.forEach((apiItem: any) => {
        const apiApproverId = isFlexTime
          ? apiItem.FLEX_TIME_APPROVAL_BY || apiItem.APPROVAL_BY_APPROVER_EMPLOYEE_CODE
          : apiItem.APPROVAL_BY_APPROVER_EMPLOYEE_CODE
        const apiStatusId = isFlexTime
          ? apiItem.FLEX_TIME_APPROVAL_STATUS || apiItem.APPROVAL_STATUS_ID
          : apiItem.APPROVAL_STATUS_ID

        if (el.APPROVER_ID.toString().toLowerCase() === apiApproverId?.toLowerCase()) {
          el.APPROVAL_STATUS_ID = apiStatusId
        }
      })
    })

    return resultArray
  }, [row, approverList, data, isFlexTime])

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
          <span style={{ margin: '0 4px' }}></span>
          <span>{APPROVER_ID}</span>
        </Box>
      ))}
    </Box>
  )
}

export default TableApprover
