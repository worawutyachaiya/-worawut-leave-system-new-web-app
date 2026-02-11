import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Card, CardHeader, Chip, IconButton, Tooltip, Box, Button, Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type {
  MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  useTimeRecordSearchApproval,
  useTimeRecordCreateApproval
} from '@/_workspace/react-query/hooks/useTimeRecordApproval'
import type { FormDataPage } from './validationSchema'
import { ToastMessageSuccess, ToastMessageError } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { TimeRecordResponseData } from '@/_workspace/types/time-record/TimeRecordInterface'
import TableApprover from '../leave-history/components/TableApprover'
import { ApproveConfirmDialog, RejectRemarkDialog } from './components/ApprovalDialogs'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY_EMPLOYEE_LEAVE } from '@/_workspace/react-query/hooks/useTimeRecordApproval'
function TimeRecordApprovalSearchResult() {
  const queryClient = useQueryClient()
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()
  useWatch({ control, name: 'searchFilters' })
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility') || {}
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(
    getValues('searchResults.columnPinning') || {}
  )
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density') || 'comfortable')
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting') || [])
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns') || {}
  )
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  })
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const onApprovalSuccess = (response: any) => {
    if (response?.data?.Status === true) {
      ToastMessageSuccess({
        title: 'Leave Approval',
        message: response?.data?.Message || 'ทำรายการสำเร็จแล้ว'
      })
      setRowSelection({})
      setIsApproveDialogOpen(false)
      setIsRejectDialogOpen(false)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_EMPLOYEE_LEAVE] })
      queryClient.invalidateQueries({ queryKey: ['NOTIFICATION'] })
    } else {
      ToastMessageError({
        title: 'Leave Approval',
        message: response?.data?.Message || 'การอนุมัติมีปัญหา'
      })
    }
  }

  const onApprovalError = (error: any) => {
    ToastMessageError({
      title: 'Leave Approval',
      message: error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
    })
  }

  const { mutate: createApproval, isPending: isApprovalLoading } = useTimeRecordCreateApproval(
    onApprovalSuccess,
    onApprovalError
  )
  const paramForSearch = {
    EMPLOYEE_CODE: getValues('searchFilters.employeeCode') || '',
    EMPLOYEE_NAME: getValues('searchFilters.employeeName') || '',
    EMPLOYEE_ID_REQUEST: getUserData()?.EMPLOYEE_CODE || '',
    SECTION: getValues('searchFilters.section') || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }
  const { data, isLoading, isFetching, isRefetching, isError } = useTimeRecordSearchApproval(
    paramForSearch,
    isEnableFetching
  )
  const getTableData = (): TimeRecordResponseData[] => {
    const result = data?.data?.ResultOnDb[1]
    if (Array.isArray(result)) {
      if (result.length > 1 && Array.isArray(result[1])) {
        return result as unknown as TimeRecordResponseData[]
      }
      if (result.length > 0 && !Array.isArray(result[0])) {
        return result as unknown as TimeRecordResponseData[]
      }
    }
    return []
  }
  const getTotalCount = (): number => {
    const result = data?.data?.ResultOnDb[1]
    if (Array.isArray(result) && Array.isArray(result[0]) && result[0][0]?.TOTAL_COUNT) {
      return result[0][0].TOTAL_COUNT
    }
    return data?.data?.TotalCountOnDb || 0
  }
  useEffect(() => {
    if (isFetching === false) setIsEnableFetching(false)
  }, [isFetching, setIsEnableFetching])
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])
  const getStatusChip = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Chip label={t('Approved')} color='success' size='small' />
      case 'REJECTED':
        return <Chip label={t('Rejected')} color='error' size='small' />
      case 'PENDING':
        return <Chip label={t('Pending')} color='warning' size='small' />
      default:
        return <Chip label={status || '-'} color='default' size='small' />
    }
  }
  const getSelectedRowsData = () => {
    const selectedIds = Object.keys(rowSelection)
    const allData = getTableData()
    return allData.filter(row => selectedIds.includes(String(row.TIME_RECORD_REQUEST_ID)))
  }
  const handleApprove = async () => {
    if (Object.keys(rowSelection).length === 0) return
    setIsApproveDialogOpen(true)
  }
  const handleReject = async () => {
    if (Object.keys(rowSelection).length === 0) return
    setIsRejectDialogOpen(true)
  }
  const handleConfirmApprove = () => {
    const selectedData = getSelectedRowsData()
    if (selectedData.length === 0) return
    createApproval({
      rowAction: selectedData.map((row: any) => ({
        TIME_RECORD_REQUEST_ID: row.TIME_RECORD_REQUEST_ID,
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
        TIME_RECORD_REQUEST_ID: row.TIME_RECORD_REQUEST_ID,
        EMPLOYEE_CODE: row.EMPLOYEE_CODE
      })),
      approvalBy: getUserData()?.EMPLOYEE_CODE || '',
      approvalStatus: 2,
      remark: remark
    })
  }
  const columns = useMemo<MRT_ColumnDef<TimeRecordResponseData>[]>(
    () => [
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: t('Employee Code'),
        enableSorting: false,
        size: 180
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: t('Employee Name'),
        enableSorting: false,
        size: 280,
        Cell: ({ row }) => (
          <Box>
            {row.original.EMPLOYEE_NAME} {row.original.EMPLOYEE_SURNAME}
          </Box>
        )
      },
      {
        accessorKey: 'SECTION',
        enableSorting: false,
        header: t('Section'),
        size: 150
      },
      {
        accessorKey: 'CREATE_DATE',
        header: t('Request Date'),
        size: 200,
        Cell: ({ cell }) => {
          return dayjs(cell.getValue<string>()).format('DD MMM YYYY HH:mm') || '-'
        }
      },
      {
        accessorKey: 'IN_TIME',
        header: t('in time'),
        size: 200,
        Cell: ({ cell }) => {
          return dayjs(cell.getValue<string>()).format('DD MMM YYYY HH:mm') || '-'
        }
      },
      {
        accessorKey: 'OUT_TIME',
        header: t('out time'),
        size: 200,
        Cell: ({ cell }) => {
          return dayjs(cell.getValue<string>()).format('DD MMM YYYY HH:mm') || '-'
        }
      },
      {
        accessorKey: 'TIME_RECORD_TYPE_DESCRIPTION',
        header: t('Reason'),
        enableSorting: false,
        size: 300
      },
      {
        accessorKey: 'TIME_RECORD_REQUEST_STATUS',
        header: t('Approval'),
        enableSorting: false,
        size: 150,
        muiTableBodyCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => {
          return <TableApprover row={row.original} />
        }
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
        titleTypographyProps={{ variant: 'h5' }}
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
          data={getTableData()}
          rowCount={getTotalCount()}
          isError={isError}
          enableRowSelection
          enableRowActions={false}
          getRowId={row => String(row.TIME_RECORD_REQUEST_ID)}
          onColumnFiltersChange={setColumnFilters}
          onColumnFilterFnsChange={setColumnFilterFns}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnVisibilityChange={setColumnVisibility}
          onDensityChange={setDensity}
          onColumnPinningChange={setColumnPinning}
          onColumnOrderChange={setColumnOrder}
          onRowSelectionChange={setRowSelection}
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
          muiTableBodyRowProps={({ row }) => ({
            onClick: row.getToggleSelectedHandler(),
            sx: { cursor: 'pointer' }
          })}
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('View Detail')}>
                <IconButton size='small'>
                  <VisibilityIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          localization={{
            clearSelection: t('Clear selection'),
            selectedCountOfRowCountRowsSelected: t('{selectedCount} of {rowCount} row(s) selected')
          }}
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
    </Card>
  )
}
export default TimeRecordApprovalSearchResult
