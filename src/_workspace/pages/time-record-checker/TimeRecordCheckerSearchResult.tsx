import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Card, CardHeader, Chip, IconButton, Tooltip, Box, Button, Stack, Divider } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
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
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useUpdateEffect } from 'react-use'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  useTimeRecordSearchHrChecker,
  useTimeRecordCreateHrChecker,
  useTimeRecordDeleteByHr
} from '@/_workspace/react-query/hooks/useTimeRecordHrChecker'
import { useQueryClient } from '@tanstack/react-query'
import { useSettings } from '@/@core/hooks/useSettings'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
import TableApprover from './components/TableApprover'
import HrCheckConfirmModal from './components/HrCheckConfirmModal'
import RejectConfirmModal from './components/RejectConfirmModal'
import ExportModal from './components/ExportModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

interface TimeRecordData {
  TIME_RECORD_REQUEST_ID?: number
  EMPLOYEE_CODE?: string
  EMPLOYEE_NAME?: string
  EMPLOYEE_SECTION?: string
  CREATE_DATE?: string
  IN_TIME?: string
  OUT_TIME?: string
  TIME_RECORD_REASON?: string
  TIME_RECORD_TYPE_DESCRIPTION?: string
  IS_APPROVED?: number
  LEAVE_REQUEST_STATUS?: number
  APPROVER?: string[]
  INUSE?: number
  [key: string]: any
}

function TimeRecordCheckerSearchResult() {
  const { settings } = useSettings()
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'en' ? 'en' : 'th')
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()
  useWatch({ control, name: 'searchFilters' })
  const queryClient = useQueryClient()

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
  const [selectedRows, setSelectedRows] = useState<{ TIME_RECORD_REQUEST_ID: number }[]>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isCheckConfirmModalOpen, setIsCheckConfirmModalOpen] = useState<boolean>(false)
  const [isRejectConfirmModalOpen, setIsRejectConfirmModalOpen] = useState<boolean>(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  const searchParams = {
    EMPLOYEE_CODE: getValues('searchFilters.employeeCode')?.EMPLOYEE_CODE || '',
    EMPLOYEE_NAME: '',
    EMPLOYEE_SECTION: getValues('searchFilters.section')?.SECTION || '',
    STATUS: getValues('searchFilters.status')?.value ?? '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['TIME_RECORD_HR_CHECKER'] })
    setIsEnableFetching(true)
    setSelectedRows([])
    setRowSelection({})
  }

  const onCreateHrCheckerSuccess = (data: any) => {
    if (data?.data?.Status) {
      ToastMessageSuccess({ message: data.data.Message || t('HR Check completed successfully') })
      setIsCheckConfirmModalOpen(false)
      refreshData()
    } else {
      ToastMessageError({ message: data?.data?.Message || t('HR Check failed') })
    }
  }

  const onCreateHrCheckerError = () => {
    ToastMessageError({ message: t('Failed to check HR') })
  }

  const { mutateAsync: createHrChecker, isPending: isCreatingHrChecker } = useTimeRecordCreateHrChecker(
    onCreateHrCheckerSuccess,
    onCreateHrCheckerError
  )

  const onDeleteByHrSuccess = (data: any) => {
    if (data?.data?.Status) {
      ToastMessageSuccess({ message: data.data.Message || t('Reject completed successfully') })
      setIsRejectConfirmModalOpen(false)
      refreshData()
    } else {
      ToastMessageError({ message: data?.data?.Message || t('Reject failed') })
    }
  }

  const onDeleteByHrError = () => {
    ToastMessageError({ message: t('Failed to reject') })
  }

  const { mutateAsync: deleteByHr, isPending: isDeletingByHr } = useTimeRecordDeleteByHr(
    onDeleteByHrSuccess,
    onDeleteByHrError
  )

  const { data, isLoading, isFetching, isRefetching, isError } = useTimeRecordSearchHrChecker(
    searchParams,
    isEnableFetching
  )

  const getTableData = (): TimeRecordData[] => {
    const result = data?.data?.ResultOnDb
    if (Array.isArray(result) && result.length > 1 && Array.isArray(result[1])) return result[1] as any
    if (Array.isArray(result) && result.length > 0 && !Array.isArray(result[0])) return result
    return []
  }

  const getTotalCount = (): number => {
    const result = data?.data?.ResultOnDb
    if (Array.isArray(result) && Array.isArray(result[0]) && result[0][0]?.TOTAL_COUNT) return result[0][0].TOTAL_COUNT
    return data?.data?.TotalCountOnDb || 0
  }

  useEffect(() => {
    if (!isFetching) setIsEnableFetching(false)
  }, [isFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])

  const handleCheckAction = async () => {
    if (selectedRows.length === 0) {
      ToastMessageError({ message: t('Please select at least one item') })
      return
    }
    setIsCheckConfirmModalOpen(true)
  }

  const handleRejectAction = async () => {
    if (selectedRows.length === 0) {
      ToastMessageError({ message: t('Please select at least one item') })
      return
    }
    setIsRejectConfirmModalOpen(true)
  }

  const handleConfirmCheck = async () => {
    const payload = {
      rowAction: selectedRows.map(row => ({
        TIME_RECORD_REQUEST_ID: row.TIME_RECORD_REQUEST_ID
      })),
      approvalBy: getUserData()?.EMPLOYEE_CODE || ''
    }
    await createHrChecker(payload)
  }

  const handleConfirmReject = async (reason: string) => {
    for (const row of selectedRows) {
      await deleteByHr({
        TIME_RECORD_REQUEST_ID: row.TIME_RECORD_REQUEST_ID,
        UPDATE_BY: getUserData()?.EMPLOYEE_CODE || '',
        REMARK: reason
      })
    }
    setIsRejectConfirmModalOpen(false)
    refreshData()
  }

  const handleMRTRowSelectionChange = (updater: any) => {
    const tableData = getTableData()
    const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater
    setRowSelection(newRowSelection)
    const newSelectedRows: { TIME_RECORD_REQUEST_ID: number }[] = []
    Object.keys(newRowSelection).forEach(key => {
      const index = parseInt(key, 10)
      if (newRowSelection[key] && tableData[index]) {
        newSelectedRows.push({
          TIME_RECORD_REQUEST_ID: tableData[index].TIME_RECORD_REQUEST_ID!
        })
      }
    })
    const otherPagesSelections = selectedRows.filter(
      row => !tableData.some(tableRow => tableRow.TIME_RECORD_REQUEST_ID === row.TIME_RECORD_REQUEST_ID)
    )
    setSelectedRows([...otherPagesSelections, ...newSelectedRows])
  }

  const getStatusChip = (status: number | undefined) => {
    switch (status) {
      case 1:
        return (
          <Chip
            label={t('Approved')}
            color='success'
            size='small'
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
          />
        )
      case 2:
        return (
          <Chip
            label={t('Rejected')}
            color='error'
            size='small'
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
          />
        )
      case 0:
      default:
        return (
          <Chip
            label={t('Pending')}
            color='warning'
            size='small'
            variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
          />
        )
    }
  }

  const columns = useMemo<MRT_ColumnDef<TimeRecordData>[]>(
    () => [
      {
        accessorKey: 'LEAVE_REQUEST_STATUS',
        header: t('Status'),
        Cell: ({ row }) => getStatusChip(row.original.LEAVE_REQUEST_STATUS),
        size: 160
      },
      {
        accessorKey: 'APPROVAL',
        header: t('Approval'),
        enableSorting: false,
        Cell: ({ row }) => <TableApprover row={row.original} />,
        size: 160
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: t('Employee Code'),
        size: 220
      },
      {
        accessorKey: 'IN_TIME',
        header: t('in time'),
        size: 200,
        Cell: ({ row }) => dayjs(row.original.IN_TIME).format('DD-MMM-YYYY HH:mm') || '-'
      },
      {
        accessorKey: 'OUT_TIME',
        header: t('out time'),
        size: 200,
        Cell: ({ row }) => dayjs(row.original.OUT_TIME).format('DD-MMM-YYYY HH:mm') || '-'
      },
      {
        accessorKey: 'TIME_RECORD_TYPE_DESCRIPTION',
        header: t('Reason')
      },
      {
        accessorKey: 'TIME_RECORD_REASON',
        header: t('Remark')
      },

      {
        accessorKey: 'CREATE_DATE',
        header: t('Request Date'),
        size: 220,
        Cell: ({ row }) => dayjs(row.original.CREATE_DATE).format('DD-MMM-YYYY HH:mm') || '-'
      },

      {
        accessorKey: 'UPDATE_DATE',
        header: t('Update Date'),
        size: 220,
        Cell: ({ row }) => dayjs(row.original.UPDATE_DATE).format('DD-MMM-YYYY HH:mm') || '-'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Update By'),
        size: 180
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
            <Button onClick={() => setIsExportModalOpen(true)} variant='contained' color='info'>
              <img
                width='20'
                height='20'
                src='https://img.icons8.com/color/48/microsoft-excel-2019--v1.png'
                alt='excel'
                className='me-1'
              />
              {t('Export')}
            </Button>
            <Divider orientation='vertical' flexItem />
            <Button
              variant='contained'
              onClick={handleCheckAction}
              color='success'
              disabled={selectedRows.length === 0 || isCreatingHrChecker}
              startIcon={<i className='tabler-circle-check' />}
            >
              {t('Check')}
            </Button>
            <Button
              variant='contained'
              onClick={handleRejectAction}
              color='error'
              disabled={selectedRows.length === 0 || isDeletingByHr}
              startIcon={<i className='tabler-trash' />}
            >
              {t('Reject')}
            </Button>
          </Stack>
        }
      />
      <HrCheckConfirmModal
        open={isCheckConfirmModalOpen}
        onClose={() => setIsCheckConfirmModalOpen(false)}
        onConfirm={handleConfirmCheck}
        selectedCount={selectedRows.length}
        isLoading={isCreatingHrChecker}
      />
      <RejectConfirmModal
        open={isRejectConfirmModalOpen}
        onClose={() => setIsRejectConfirmModalOpen(false)}
        onConfirm={handleConfirmReject}
        selectedCount={selectedRows.length}
        isLoading={isDeletingByHr}
      />
      <ExportModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} searchParams={searchParams} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DxMRTTable
          enableRowActions={false}
          columns={columns}
          data={getTableData()}
          rowCount={getTotalCount()}
          isError={isError}
          onColumnFiltersChange={setColumnFilters}
          onColumnFilterFnsChange={setColumnFilterFns}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnVisibilityChange={setColumnVisibility}
          onDensityChange={setDensity}
          onColumnPinningChange={setColumnPinning}
          onColumnOrderChange={setColumnOrder}
          onRowSelectionChange={handleMRTRowSelectionChange}
          enableRowSelection={row => row.original.IS_APPROVED !== 1 && row.original.INUSE === 1}
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
          muiTableProps={{ sx: { tableLayout: 'auto' } }}
        />
      </LocalizationProvider>
    </Card>
  )
}

export default TimeRecordCheckerSearchResult
