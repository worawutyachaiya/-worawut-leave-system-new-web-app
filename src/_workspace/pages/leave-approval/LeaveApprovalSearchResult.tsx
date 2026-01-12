import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Card, CardHeader, Stack, Typography, useTheme, Button, Chip, IconButton } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useUpdateEffect } from 'react-use'
import type {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_RowSelectionState,
  MRT_VisibilityState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_ColumnFiltersState,
  MRT_Row,
  MRT_ColumnFilterFnsState
} from 'material-react-table'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useCheckPermission } from '@/_template/CheckPermission'
import { useSettings } from '@/@core/hooks/useSettings'
import {
  useLeaveEmployeeSearch,
  useLeaveApprovalCreate,
  PREFIX_QUERY_KEY_EMPLOYEE_LEAVE
} from '@/_workspace/react-query/hooks/useLeaveApproval'
import TableApprover from '../leave-history/components/TableApprover'
import LeaveFileColumn from './components/LeaveFileColumn'
import { ApproveConfirmDialog, RejectRemarkDialog } from './components/ApprovalDialogs'
import EmployeeDetailModal from './components/EmployeeDetailModal'
import { ToastMessageSuccess, ToastMessageError } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
import { LeaveAlRemainInterface } from '@/_workspace/types/leave-employee-information/LeaveEmployeeInformationInterface'
import { EmployeeLeaveInterface } from '@/_workspace/types/employee-leave/EmployeeLeaveInterface'
import { useTranslation } from '@/contexts/TranslationContext'

const EmployeeLeaveSearchResultTable = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue, watch } = useFormContext<FormDataPage>()
  const { settings } = useSettings()
  const checkPermission = useCheckPermission()
  const queryClient = useQueryClient()
  const [rowSelected, setRowSelected] = useState<MRT_Row<LeaveAlRemainInterface> | null>(null)
  const [isEmployeeDetailOpen, setIsEmployeeDetailOpen] = useState(false)
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize')
  })
  const searchFilters = watch('searchFilters')
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const { mutate: createApproval, isPending: isApprovalLoading } = useLeaveApprovalCreate(
    (response: any) => {
      if (response?.data?.Status === true) {
        ToastMessageSuccess({
          title: 'Leave Approval',
          message: response?.data?.Message || 'ทำรายการสำเร็จแล้ว'
        })
        setRowSelection({})
        setIsApproveDialogOpen(false)
        setIsRejectDialogOpen(false)
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_EMPLOYEE_LEAVE] })
        queryClient.invalidateQueries({ queryKey: ['NOTIFICATION'] })
        setIsEnableFetching(true)
      } else {
        ToastMessageError({
          title: 'Leave Approval',
          message: response?.data?.Message || 'การอนุมัติมีปัญหา'
        })
      }
    },
    (error: any) => {
      ToastMessageError({
        title: 'Leave Approval',
        message: error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      })
    }
  )
  const paramForSearch = {
    EMPLOYEE_CODE: searchFilters?.employeeCode || '',
    EMPLOYEE_NAME: searchFilters?.employeeName || '',
    LEAVE_TYPE_ID: searchFilters?.leaveType?.LEAVE_TYPE_ID || '',
    EMPLOYEE_SECTION: searchFilters?.section?.SECTION || '',
    EMPLOYEE_ID_REQUEST: getUserData()?.EMPLOYEE_CODE || '',
    Start: String(pagination.pageIndex * pagination.pageSize),
    Limit: String(pagination.pageSize),
    Order: []
  }

  const { data, isLoading, isError, isFetching, isRefetching } = useLeaveEmployeeSearch(
    paramForSearch,
    isEnableFetching
  )
  useEffect(() => {
    if (isFetching === false) setIsEnableFetching(false)
  }, [isFetching, setIsEnableFetching])
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])
  const tableData = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb?.[1] as any
    if (Array.isArray(rawResult) && Array.isArray(rawResult[1])) {
      return rawResult[1]
    }
    if (
      Array.isArray(rawResult) &&
      rawResult.length > 0 &&
      typeof rawResult[0] === 'object' &&
      !Array.isArray(rawResult[0])
    ) {
      return rawResult
    }
    return []
  }, [data])
  const totalRecords = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    if (Array.isArray(rawResult) && Array.isArray(rawResult[0]) && rawResult[0][0]?.TOTAL_COUNT) {
      return rawResult[0][0].TOTAL_COUNT
    }
    return data?.data?.TotalCountOnDb || 0
  }, [data])
  const getSelectedRowsData = () => {
    const selectedIndices = Object.keys(rowSelection)
    return selectedIndices.map(index => tableData[Number(index)]).filter(Boolean)
  }
  const handleApprove = () => {
    if (Object.keys(rowSelection).length === 0) return
    setIsApproveDialogOpen(true)
  }
  const handleReject = () => {
    if (Object.keys(rowSelection).length === 0) return
    setIsRejectDialogOpen(true)
  }
  const handleConfirmApprove = () => {
    const selectedData = getSelectedRowsData()
    if (selectedData.length === 0) return
    createApproval({
      rowAction: selectedData.map((row: any) => ({
        LEAVE_REQUEST_ID: row.LEAVE_REQUEST_ID,
        EMPLOYEE_CODE: row.EMPLOYEE_CODE
      })),
      approvalBy: getUserData()?.EMPLOYEE_CODE || '',
      approvalStatus: 1
    })
  }
  const handleConfirmReject = (remark: string) => {
    const selectedData = getSelectedRowsData()
    if (selectedData.length === 0) return
    createApproval({
      rowAction: selectedData.map((row: any) => ({
        LEAVE_REQUEST_ID: row.LEAVE_REQUEST_ID,
        EMPLOYEE_CODE: row.EMPLOYEE_CODE
      })),
      approvalBy: getUserData()?.EMPLOYEE_CODE || '',
      approvalStatus: 2,
      remark: remark
    })
  }
  const columns = useMemo<MRT_ColumnDef<EmployeeLeaveInterface>[]>(
    () => [
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: t('Employee Code'),
        size: 200
      },
      {
        enableColumnOrdering: true,
        accessorKey: 'EMPLOYEE_NAME',
        header: t('Employee Name'),
        Cell: ({ row }) => {
          const name = (row.original as any).EMPLOYEE_NAME + ' ' + (row.original as any).EMPLOYEE_SURNAME || '-'
          return name
        }
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: t('Section'),
        size: 160
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_EN',
        header: t('Leave Type'),
        size: 180,
        Cell: ({ row }) => {
          const desc =
            (row.original as any).LEAVE_TYPE_DESCRIPTION_EN || (row.original as any).LEAVE_TYPE_DESCRIPTION_TH || '-'
          return desc
        }
      },
      {
        accessorKey: 'CREATE_DATE',
        header: t('Request Date'),
        size: 180,
        Cell: ({ row }) => {
          const reqDate = (row.original as any).CREATE_DATE
          return reqDate ? dayjs(reqDate).format('YYYY-MM-DD') : '-'
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_START_DATE',
        header: t('Leave Date'),
        size: 240,
        Cell: ({ row }) => {
          const startDate = row.original?.LEAVE_REQUEST_START_DATE
          const endDate = row.original?.LEAVE_REQUEST_END_DATE
          return (
            <>
              {startDate ? dayjs(startDate).format('YYYY-MM-DD') : '-'}
              {' ' + t('to') + ' '}
              {endDate ? dayjs(endDate).format('YYYY-MM-DD') : '-'}
            </>
          )
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME',
        header: t('Time'),
        size: 140
      },
      {
        accessorKey: 'TOTAL_LEAVE_DAY',
        header: t('Total Day'),
        size: 160,
        Cell: ({ row }) => (row.original as any).LEAVE_REQUEST_TOTAL_DAY || '-'
      },
      {
        accessorKey: 'ATTACHMENT',
        header: t('Attachment'),
        size: 200,
        muiTableBodyCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => {
          return (
            <LeaveFileColumn
              fileName={row.original.LEAVE_REQUEST_FILE_UPLOAD_NAME}
              filePath={row.original.LEAVE_REQUEST_FILE_UPLOAD_PATH}
            />
          )
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_REMARK',
        header: t('Remark'),
        Cell: ({ row }) => (row.original as any).REMARK || '-'
      },
      {
        accessorKey: 'STATUS',
        header: t('Approval'),
        enableSorting: false,
        size: 130,
        muiTableBodyCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => {
          return <TableApprover row={row.original} />
        }
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: t('Update Date'),
        size: 170,
        Cell: ({ row }) => {
          const uDate = (row.original as any).UPDATE_DATE
          return uDate ? dayjs(uDate).format('YYYY-MM-DD') : '-'
        }
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Update By'),
        size: 160,
        Cell: ({ row }) => (row.original as any).UPDATE_BY || '-'
      },
      {
        id: 'actions',
        header: t('Employee Detail'),
        size: 180,
        muiTableBodyCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => (
          <IconButton
            size='large'
            onClick={e => {
              e.stopPropagation()
              setSelectedEmployeeCode((row.original as any).EMPLOYEE_CODE || '')
              setIsEmployeeDetailOpen(true)
            }}
          >
            <VisibilityIcon fontSize='large' />
          </IconButton>
        )
      }
    ],
    [t]
  )
  const isFirstRender = useRef(true)
  useEffect(() => {
    isFirstRender.current = false
  }, [])
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.columnFilters', columnFilters)
  }, [setValue, columnFilters])
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.sorting', sorting)
  }, [setValue, sorting])
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.density', density)
  }, [setValue, density])
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.columnVisibility', columnVisibility)
  }, [setValue, columnVisibility])
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.columnPinning', columnPinning)
  }, [setValue, columnPinning])
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.columnOrder', columnOrder)
  }, [setValue, columnOrder])
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.columnFilterFns', columnFilterFns)
  }, [setValue, columnFilterFns])
  return (
    <Card>
      <CardHeader
        title={t('Search result')}
        action={
          <Stack direction='row' spacing={2} alignItems='center'>
            <Typography variant='subtitle1' fontWeight='bold'>
              {t('Row Selected')}: {Object.keys(rowSelection).length}
            </Typography>
            <Button
              variant='tonal'
              color='success'
              disabled={Object.keys(rowSelection).length === 0}
              onClick={handleApprove}
            >
              {t('Approve')}
            </Button>
            <Button
              variant='tonal'
              color='error'
              disabled={Object.keys(rowSelection).length === 0}
              onClick={handleReject}
            >
              {t('Reject')}
            </Button>
          </Stack>
        }
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DxMRTTable
          columns={columns}
          data={tableData}
          isError={isError}
          rowCount={totalRecords}
          state={{
            columnFilters,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isRefetching,
            sorting,
            density,
            columnVisibility,
            columnPinning,
            columnOrder,
            columnFilterFns,
            rowSelection
          }}
          onColumnFiltersChange={setColumnFilters}
          onColumnFilterFnsChange={setColumnFilterFns}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnVisibilityChange={setColumnVisibility}
          onDensityChange={setDensity}
          onColumnPinningChange={setColumnPinning}
          onColumnOrderChange={setColumnOrder}
          onRowSelectionChange={setRowSelection}
          enableRowSelection
          enableRowActions={false}
          manualPagination
          manualSorting
          enableColumnOrdering
          enableColumnActions={false}
          enableColumnFilters={false}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          muiTableBodyRowProps={({ row }) => ({
            onClick: row.getToggleSelectedHandler(),
            sx: { cursor: 'pointer' }
          })}
        />
      </LocalizationProvider>
      {/* Approval Dialogs */}
      <ApproveConfirmDialog
        open={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={handleConfirmApprove}
        isLoading={isApprovalLoading}
        selectedCount={Object.keys(rowSelection).length}
      />
      <RejectRemarkDialog
        open={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        isLoading={isApprovalLoading}
        selectedCount={Object.keys(rowSelection).length}
      />
      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        open={isEmployeeDetailOpen}
        onClose={() => setIsEmployeeDetailOpen(false)}
        employeeCode={selectedEmployeeCode}
      />
    </Card>
  )
}
export default EmployeeLeaveSearchResultTable
