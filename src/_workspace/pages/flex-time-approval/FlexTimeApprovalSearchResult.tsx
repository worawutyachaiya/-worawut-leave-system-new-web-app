import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Box, Button, Card, CardHeader, Chip, Stack, Typography, useTheme } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useFormContext, useWatch } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
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
import { useSettings } from '@/@core/hooks/useSettings'
import {
  useSearchFlexTimeApproval,
  useCreateFlexTimeApproval,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useFlexTime'
import { ApproveConfirmDialog, RejectRemarkDialog } from './components/ApprovalDialogs'
import { ToastMessageSuccess, ToastMessageError } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
import type { FlexTimeRequestData } from '@/_workspace/types/flex-time/FlexTimeInterface'
function FlexTimeApprovalSearchResult() {
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const theme = useTheme()
  const { settings } = useSettings()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const queryClient = useQueryClient()
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
  const sectionValue = getValues('searchFilters.section')?.SECTION || getValues('searchFilters.section') || ''
  const paramForSearch = {
    EMPLOYEE_CODE: getValues('searchFilters.employeeCode') || '',
    EMPLOYEE_NAME: getValues('searchFilters.employeeName') || '',
    EMPLOYEE_SECTION: sectionValue,
    EMPLOYEE_CODE_REQUEST: getUserData()?.EMPLOYEE_CODE || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }
  const { data, isLoading, isFetching, isRefetching, isError } = useSearchFlexTimeApproval(
    paramForSearch,
    isEnableFetching
  )
  const onApprovalSuccess = (response: any) => {
    if (response?.data?.Status === true) {
      ToastMessageSuccess({
        title: 'Flex Time Approval',
        message: response?.data?.Message || 'ทำรายการสำเร็จแล้ว'
      })
      setRowSelection({})
      setIsApproveDialogOpen(false)
      setIsRejectDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_APPROVAL`] })
      queryClient.invalidateQueries({ queryKey: ['NOTIFICATION'] })
      setIsEnableFetching(true)
    } else {
      ToastMessageError({
        title: 'Flex Time Approval',
        message: response?.data?.Message || 'การอนุมัติมีปัญหา'
      })
    }
  }

  const onApprovalError = (error: any) => {
    ToastMessageError({
      title: 'Flex Time Approval',
      message: error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
    })
  }

  const { mutate: createApproval, isPending: isApprovalLoading } = useCreateFlexTimeApproval(
    onApprovalSuccess,
    onApprovalError
  )
  const tableData = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    if (!rawResult) return []
    if (Array.isArray(rawResult) && rawResult.length >= 2 && Array.isArray(rawResult[1])) {
      return rawResult[1] as FlexTimeRequestData[]
    }
    return []
  }, [data])
  const totalRecords = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    if (!rawResult) return 0
    if (
      Array.isArray(rawResult) &&
      rawResult.length >= 1 &&
      Array.isArray(rawResult[0]) &&
      rawResult[0][0]?.TOTAL_COUNT !== undefined
    ) {
      return rawResult[0][0].TOTAL_COUNT
    }
    return data?.data?.TotalCountOnDb || 0
  }, [data])
  useEffect(() => {
    if (isFetching === false) setIsEnableFetching(false)
  }, [isFetching, setIsEnableFetching])
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])
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
        FLEX_TIME_REQUEST_ID: row.FLEX_TIME_REQUEST_ID,
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
        FLEX_TIME_REQUEST_ID: row.FLEX_TIME_REQUEST_ID,
        EMPLOYEE_CODE: row.EMPLOYEE_CODE
      })),
      approvalBy: getUserData()?.EMPLOYEE_CODE || '',
      approvalStatus: 2,
      remark: remark
    })
  }
  const getStatusChip = (row: FlexTimeRequestData) => {
    const status = row.IS_APPROVER_APPROVED ?? row.STATUS ?? row.IS_APPROVED
    switch (String(status)) {
      case '0':
        return (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            label={t('Pending')}
            color='warning'
            size='small'
          />
        )
      case '1':
        return (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            label={t('Approved')}
            color='success'
            size='small'
          />
        )
      case '2':
        return (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            label={t('Rejected')}
            color='error'
            size='small'
          />
        )
      default:
        return (
          <Chip
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
            label={t('Pending')}
            color='warning'
            size='small'
          />
        )
    }
  }
  const columns = useMemo<MRT_ColumnDef<FlexTimeRequestData>[]>(
    () => [
      {
        accessorKey: 'STATUS',
        header: t('Status'),
        enableSorting: false,
        Cell: ({ row }) => getStatusChip(row.original),
        size: 140
      },
      {
        accessorKey: 'SECT_NAME',
        header: t('Section'),
        enableSorting: false,
        size: 140
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        enableSorting: false,
        header: t('Employee Code'),
        size: 200
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        enableSorting: false,
        header: t('Employee Name'),
        Cell: ({ row }) => row.original.EMPLOYEE_NAME + ' ' + row.original.EMPLOYEE_SURNAME
      },
      {
        accessorKey: 'FLEX_TIME_DESCRIPTION',
        enableSorting: false,
        header: t('Flex Time Type'),
        size: 200
      },
      {
        accessorKey: 'START_DATE',
        header: t('Start Date'),
        enableSorting: false,
        size: 180,
        Cell: ({ row }) => {
          const date = row.original.START_DATE || row.original.FLEX_TIME_REQUEST_START_DATE
          return date ? dayjs(date).format('DD MMM YYYY') : '-'
        }
      },
      {
        accessorKey: 'END_DATE',
        header: t('End Date'),
        enableSorting: false,
        size: 180,
        Cell: ({ row }) => {
          const date = row.original.END_DATE || row.original.FLEX_TIME_REQUEST_END_DATE
          return date ? dayjs(date).format('DD MMM YYYY') : '-'
        }
      },
      {
        accessorKey: 'REASON',
        enableSorting: false,
        header: t('Reason'),
        Cell: ({ row }) => row.original.REASON || row.original.DESCRIPTION || '-'
      },
      {
        accessorKey: 'CREATE_DATE',
        enableSorting: false,
        header: t('Request Date'),
        size: 180,
        Cell: ({ row }) => dayjs(row.original.CREATE_DATE).format('DD MMM YYYY') || '-'
      }
    ],
    [t, settings.mode]
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
          muiTableProps={{ sx: { tableLayout: 'auto' } }}
          localization={{
            clearSelection: t('Clear selection'),
            selectedCountOfRowCountRowsSelected: t('{selectedCount} of {rowCount} row(s) selected')
          }}
        />
      </LocalizationProvider>
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
export default FlexTimeApprovalSearchResult
