import { forwardRef, ReactElement, Ref, useEffect, useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import type { SlideProps } from '@mui/material'
import { Slide, useTheme } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import BadgeIcon from '@mui/icons-material/Badge'
import BusinessIcon from '@mui/icons-material/Business'
import WorkIcon from '@mui/icons-material/Work'
import CakeIcon from '@mui/icons-material/Cake'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table'
import dayjs from 'dayjs'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useSettings } from '@/@core/hooks/useSettings'
import { useSearchEmployeeInformation } from '@/_workspace/react-query/hooks/useLeaveEmployeeInformation'
import { useLeaveHistorySearch } from '@/_workspace/react-query/hooks/useLeaveHistorySearch'
import { LeaveHistoryInterface } from '@/_workspace/types/leave-history/LeaveHistoryInterface'
import { LeaveEmployeeInformationInterface } from '@/_workspace/types/leave-employee-information/LeaveEmployeeInformationInterface'
import { ImageEmployeeFromURL } from '@/libs/react-query/hooks/common-system/useImageData'
import TableApprover from '../../leave-history/components/TableApprover'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { useTranslation } from '@/contexts/TranslationContext'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
interface EmployeeDetailModalProps {
  open: boolean
  onClose: () => void
  employeeCode: string
}
const InfoItem = ({
  icon,
  label,
  value,
  isLoading
}: {
  icon: React.ReactNode
  label: string
  value: string | number | undefined
  isLoading: boolean
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Box sx={{ color: 'primary.main' }}>{icon}</Box>
    <Box>
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton width={120} height={20} />
      ) : (
        <Typography variant='body2' fontWeight={500}>
          {value || '-'}
        </Typography>
      )}
    </Box>
  </Box>
)
const EmployeeDetailModal = ({ open, onClose, employeeCode }: EmployeeDetailModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { settings } = useSettings()
  const [employeeImage, setEmployeeImage] = useState<string>('')
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5
  })
  const { data: employeeData, isLoading: isLoadingEmployee } = useSearchEmployeeInformation(
    { EMPLOYEE_CODE: employeeCode },
    open && !!employeeCode
  )
  const employee: LeaveEmployeeInformationInterface | null = useMemo(() => {
    const result = employeeData?.data?.ResultOnDb
    if (Array.isArray(result) && result.length > 0) {
      return result[0]
    }
    return null
  }, [employeeData])
  const leaveHistoryParams = useMemo(
    () => ({
      LEAVE_REQUEST_DATE: '',
      LEAVE_TYPE_CODE: '',
      INUSE: '',
      EMPLOYEE_CODE: employeeCode,
      Start: pagination.pageIndex * pagination.pageSize,
      Limit: pagination.pageSize
      // Order: sorting
    }),
    [employeeCode, pagination.pageIndex, pagination.pageSize]
  )
  const {
    data: leaveHistoryData,
    isLoading: isLoadingHistory,
    isRefetching: isRefetchingHistory
  } = useLeaveHistorySearch(leaveHistoryParams, open && !!employeeCode)
  const leaveHistoryTableData = useMemo((): LeaveHistoryInterface[] => {
    const rawResult = leaveHistoryData?.data?.ResultOnDb
    if (Array.isArray(rawResult) && rawResult.length > 1 && Array.isArray(rawResult[1])) {
      return rawResult[1] as LeaveHistoryInterface[]
    }
    if (Array.isArray(rawResult) && rawResult.length > 0 && !Array.isArray(rawResult[0])) {
      return rawResult as LeaveHistoryInterface[]
    }
    return []
  }, [leaveHistoryData])
  const totalRecords = useMemo(() => {
    const rawResult = leaveHistoryData?.data?.ResultOnDb as any
    if (Array.isArray(rawResult) && Array.isArray(rawResult[0]) && rawResult[0][0]?.TOTAL_COUNT) {
      return rawResult[0][0].TOTAL_COUNT
    }
    return leaveHistoryData?.data?.TotalCountOnDb || 0
  }, [leaveHistoryData])
  useEffect(() => {
    if (open && employeeCode) {
      setEmployeeImage('')
      ImageEmployeeFromURL(employeeCode, setEmployeeImage, setEmployeeImage)
    }
  }, [open, employeeCode])
  useEffect(() => {
    if (!open) {
      setEmployeeImage('')
      setPagination({ pageIndex: 0, pageSize: 5 })
    }
  }, [open])
  const columns = useMemo<MRT_ColumnDef<LeaveHistoryInterface>[]>(
    () => [
      {
        accessorKey: 'LEAVE_REQUEST_STATUS',
        header: t('Status'),
        size: 120,
        Cell: ({ cell, row }) => {
          if (row.original.INUSE === 0 || row.original.INUSE === '0') {
            return (
              <Chip
                variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
                size='small'
                label={t('Cancelled')}
                color='error'
              />
            )
          }
          const status = cell.getValue<string>()
          const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
            '0': { label: t('Pending'), color: 'warning' },
            '1': { label: t('Approved'), color: 'success' },
            '2': { label: t('Rejected'), color: 'error' }
          }
          const config = statusConfig[status] || { label: status || '-', color: 'warning' }
          return (
            <Chip
              variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
              size='small'
              label={config.label}
              color={config.color}
            />
          )
        }
      },
      {
        accessorKey: 'APPROVER',
        header: t('Approval'),
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => <TableApprover row={row.original} />
      },
      {
        accessorKey: 'LEAVE_TYPE_CODE',
        header: t('Leave Code'),
        size: 150
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_TH',
        header: t('Leave Type'),
        size: 150
      },
      {
        accessorKey: 'CREATE_DATE',
        header: t('Request Date'),
        size: 180,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>()
          return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'
        }
      },
      {
        accessorKey: 'LEAVE_DATE_RANGE',
        header: t('Leave Date'),
        size: 180,
        enableSorting: false
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME',
        header: t('Time'),
        size: 120,
        enableSorting: false
      },
      {
        accessorKey: 'LEAVE_REQUEST_TOTAL_DAY',
        header: t('Total Day'),
        size: 100
      },
      {
        accessorKey: 'LEAVE_REQUEST_REASON',
        header: t('Reason'),
        size: 150,
        enableSorting: false
      },
      {
        accessorKey: 'LEAVE_REQUEST_REMARK',
        header: t('Remark'),
        size: 150,
        enableSorting: false
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: t('Update Date'),
        size: 180,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>()
          return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'
        }
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Update By'),
        size: 150
      }
    ],
    [settings.mode]
  )
  return (
    <Dialog
      fullWidth
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose()
        }
      }}
      TransitionComponent={Transition}
      keepMounted
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          minHeight: '90vh',
          overflow: 'visible',
          width: '95vw',
          maxWidth: '1800px'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}
      >
        <Typography variant='h5' fontWeight='bold'>
          {t('Employee Detail')}
        </Typography>
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 3 }}>
        {/* Employee Information Card */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          {/* <CardHeader
            title='Employee Information'
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            sx={{ pb: 0 }}
          /> */}
          <CardHeader title={t('Employee Information')} />
          <CardContent>
            {/* Centered layout like old implementation */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              {/* Avatar */}
              <Box>
                {isLoadingEmployee ? (
                  <Skeleton variant='rectangular' width={150} height={180} />
                ) : (
                  <Avatar
                    src={employeeImage || undefined}
                    alt={employee?.EMPLOYEE_NAME || 'Employee'}
                    variant='rounded'
                    sx={{
                      width: 150,
                      height: 180,
                      fontSize: '3rem',
                      bgcolor: 'primary.main'
                    }}
                  >
                    {employee?.EMPLOYEE_NAME?.charAt(0) || '?'}
                  </Avatar>
                )}
              </Box>
              {/* Employee Info - Simple list with icons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant='body1'>
                    <strong>{t('Name')} :</strong>{' '}
                    {employee ? `${employee.EMPLOYEE_NAME || ''} ${employee.EMPLOYEE_SURNAME || ''}` : '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BadgeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant='body1'>
                    <strong>{t('ID')} :</strong> {employee?.EMPLOYEE_CODE || '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant='body1'>
                    <strong>{t('Department')} :</strong>{' '}
                    {employee ? `${employee.EMPLOYEE_DEPT || ''} / ${employee.EMPLOYEE_SECTION || ''}` : '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant='body1'>
                    <strong>{t('Start Work')} :</strong>{' '}
                    {employee?.EMPLOYEE_START_WORK ? dayjs(employee.EMPLOYEE_START_WORK).format('DD / MM / YYYY') : '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant='body1'>
                    <strong>{t('Work Experience')} :</strong>{' '}
                    {employee?.EMPLOYEE_EXP !== undefined && employee?.EMPLOYEE_EXP !== null
                      ? `${employee.EMPLOYEE_EXP} ${t('year(s)')}`
                      : '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CakeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant='body1'>
                    <strong>{t('Birth date')} :</strong>{' '}
                    {employee?.EMPLOYEE_BIRTH_DAY ? dayjs(employee.EMPLOYEE_BIRTH_DAY).format('DD / MM / YYYY') : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        {/* Leave History Table */}
        <Card>
          <CardHeader title={t('Leave History')} />
          <DxMRTTable
            columns={columns}
            data={leaveHistoryTableData}
            isError={false}
            rowCount={totalRecords}
            state={{
              isLoading: isLoadingHistory,
              pagination,
              showProgressBars: isRefetchingHistory,
              density: 'compact'
            }}
            onPaginationChange={setPagination}
            manualPagination
            enableRowActions={false}
            enableColumnActions={false}
            enableColumnFilters={false}
            enableSorting={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableRowSelection={false}
            initialState={{
              columnOrder: [
                'LEAVE_REQUEST_STATUS',
                'APPROVER',
                'LEAVE_TYPE_CODE',
                'LEAVE_TYPE_DESCRIPTION_TH',
                'CREATE_DATE',
                'LEAVE_DATE_RANGE',
                'LEAVE_REQUEST_TIME',
                'LEAVE_REQUEST_TOTAL_DAY',
                'LEAVE_REQUEST_REASON',
                'LEAVE_REQUEST_REMARK',
                'UPDATE_DATE',
                'UPDATE_BY'
              ]
            }}
            muiTablePaperProps={{
              elevation: 0,
              sx: { border: 'none' }
            }}
            renderEmptyRowsFallback={() => (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('No leave history found')}
                </Typography>
              </Box>
            )}
          />
        </Card>
      </DialogContent>
      {/* Footer */}
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant='outlined' color='secondary' onClick={onClose}>
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default EmployeeDetailModal
