import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Box, Card, Stack, Typography, Button, CardHeader, Chip } from '@mui/material'
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
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import { useFormContext } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useSettings } from '@/@core/hooks/useSettings'
import { useSearchHrChecker, useCreateHrCheckerM75 } from '@/_workspace/react-query/hooks/useSearchHrChecker'
import { useQueryClient } from '@tanstack/react-query'
import type { FormDataPage } from './ValidationSchema'
import type { HrCheckerM75ResponseData } from '@/_workspace/types/hr-checker-m75/HrCheckerM75Interface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import LeaveFileColumn from './components/LeaveFileColumn'
import TableApprover from './components/TableApprover'
import HrCheckM75ConfirmModal from './modal/HrCheckM75ConfirmModal'
import HrCheckM75ExportModal from './modal/HrCheckM75ExportModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

// Helper functions
const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY')
}

const statusApprove: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Approved', color: 'success' },
  2: { label: 'Rejected', color: 'error' }
}

const DISPLAY_COLUMN_OPTIONS = {
  'mrt-row-actions': {
    muiTableHeadCellProps: { align: 'center' as const },
    muiTableBodyCellProps: { align: 'center' as const }
  }
}
const TABLE_PROPS = { sx: { tableLayout: 'auto' } }

function HrcheckM75SearchResult() {
  const { settings } = useSettings()
  const { t } = useTranslation()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility') || {}
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([])
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
  const queryClient = useQueryClient()

  // Row selection state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [selectedRows, setSelectedRows] = useState<Array<{ LEAVE_REQUEST_ID: number; TYPE: string }>>([])
  const [isCheckConfirmModalOpen, setIsCheckConfirmModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const params = {
    EMPLOYEE_CODE: getValues('searchFilters.employeeCode')?.EMPLOYEE_CODE || '',
    LEAVE_TYPE: getValues('searchFilters.leaveType')?.map(item => item.LEAVE_TYPE_ID) || [],
    START_DATE: getValues('searchFilters.startDate') || dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
    END_DATE: getValues('searchFilters.endDate') || dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'),
    STATUS: getValues('searchFilters.status')?.value || '', // Extract value from object
    M75: true, // Specific filter for M75
    Start: pagination.pageIndex,
    Limit: pagination.pageSize,
    Order: sorting.length > 0 ? sorting : undefined // Match hr-document pattern
  }

  const { data, isLoading, isError, isFetching } = useSearchHrChecker(params, isEnableFetching)

  const finalData = useMemo(() => {
    if (data?.data?.ResultOnDb && Array.isArray(data.data.ResultOnDb)) {
      return (data.data.ResultOnDb[1] as any) || []
    }
    return []
  }, [data])

  const totalRecords = useMemo(() => {
    if (data?.data?.TotalCountOnDb) {
      return data.data.TotalCountOnDb
    }
    return 0
  }, [data])

  // Helper function to get all selectable data (M75 specific: approved by all approvers)
  const getAllSelectableData = (): { LEAVE_REQUEST_ID: number; TYPE: string }[] => {
    if (Array.isArray(data?.data?.ResultOnDb) && data.data.ResultOnDb.length > 2) {
      const allData = data.data.ResultOnDb[2] as unknown as HrCheckerM75ResponseData[]
      return allData
        .filter(row => !row.CHECKED)
        .map(row => ({
          LEAVE_REQUEST_ID: row.LEAVE_REQUEST_ID,
          TYPE: row.TYPE
        }))
    }
    return []
  }

  // M75 Check mutation
  const { mutateAsync: createHrCheckerM75, isPending: isCreatingHrChecker } = useCreateHrCheckerM75(
    data => {
      if (data?.data?.Status) {
        ToastMessageSuccess({ message: data.data.Message || t('M75 Check Success') })
        queryClient.invalidateQueries({ queryKey: ['HR_CHECK_M75'] })
        setSelectedRows([])
        setRowSelection({})
        setIsCheckConfirmModalOpen(false)
        setIsEnableFetching(true)
      } else {
        ToastMessageError({ message: data?.data?.Message || t('M75 Check Failed') })
      }
    },
    error => {
      ToastMessageError({ message: error.message || t('An error occurred') })
    }
  )

  const handleConfirmCheck = async () => {
    const payload = {
      rowAction: selectedRows.map(row => ({
        LEAVE_REQUEST_ID: String(row.LEAVE_REQUEST_ID),
        TYPE: row.TYPE
      })),
      approvalBy: getUserData()?.EMPLOYEE_CODE || '',
      totalCount: selectedRows.length
    }
    await createHrCheckerM75(payload)
  }

  const handleCheckAction = async () => {
    if (selectedRows.length === 0) {
      ToastMessageError({ message: t('Please select at least one item') })
      return
    }
    setIsCheckConfirmModalOpen(true)
  }

  const handleSelectPageData = () => {
    const newSelectedRows = finalData
      .filter((row: HrCheckerM75ResponseData) => !row.CHECKED)
      .map((row: HrCheckerM75ResponseData) => ({
        LEAVE_REQUEST_ID: row.LEAVE_REQUEST_ID,
        TYPE: row.TYPE
      }))
    if (newSelectedRows.length === 0) {
      ToastMessageError({ message: t('No selectable items on this page') })
      return
    }
    const mergedRows = [...selectedRows]
    newSelectedRows.forEach((newRow: { LEAVE_REQUEST_ID: number; TYPE: string }) => {
      if (!mergedRows.some(existing => existing.LEAVE_REQUEST_ID === newRow.LEAVE_REQUEST_ID)) {
        mergedRows.push(newRow)
      }
    })
    setSelectedRows(mergedRows)
    const newRowSelection: Record<string, boolean> = { ...rowSelection }
    finalData.forEach((row: HrCheckerM75ResponseData) => {
      if (!row.CHECKED) {
        newRowSelection[String(row.LEAVE_REQUEST_ID)] = true
      }
    })
    setRowSelection(newRowSelection)
    ToastMessageSuccess({ message: `${t('Selected')} ${newSelectedRows.length} ${t('items on this page')}` })
  }

  const handleMRTRowSelectionChange = (updater: any) => {
    const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater
    setRowSelection(newRowSelection)

    // Find rows in current view that are selected
    const currentViewSelectedRows: { LEAVE_REQUEST_ID: number; TYPE: string }[] = []
    finalData.forEach((row: HrCheckerM75ResponseData) => {
      if (newRowSelection[String(row.LEAVE_REQUEST_ID)]) {
        currentViewSelectedRows.push({
          LEAVE_REQUEST_ID: row.LEAVE_REQUEST_ID,
          TYPE: row.TYPE
        })
      }
    })

    // Keep selections from other pages
    const otherPagesSelections = selectedRows.filter(
      row => !finalData.some((tableRow: HrCheckerM75ResponseData) => tableRow.LEAVE_REQUEST_ID === row.LEAVE_REQUEST_ID)
    )

    setSelectedRows([...otherPagesSelections, ...currentViewSelectedRows])
  }

  // Update fetching state
  useEffect(() => {
    if (data && !isLoading) setIsEnableFetching(false)
  }, [data, isLoading, setIsEnableFetching])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])

  // // Memoize row selection function

  const columns = useMemo<MRT_ColumnDef<HrCheckerM75ResponseData>[]>(
    () => [
      {
        accessorKey: 'LEAVE_REQUEST_STATUS',
        header: t('Status'),
        size: 135,
        enableSorting: false,
        muiTableBodyCellProps: {
          align: 'center'
        },
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
          const status = cell.getValue<number>()
          const config = statusApprove[String(status)] || { label: 'Pending', color: 'warning' }
          return (
            <Chip
              variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
              size='small'
              label={t(config.label)}
              color={config.color}
            />
          )
        }
      },
      {
        accessorKey: 'APPROVER',
        header: t('Approval'),
        size: 200,
        enableSorting: false,
        muiTableBodyCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => {
          return <TableApprover row={row.original} />
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_EMPLOYEE_CODE',
        header: t('Employee Code'),
        size: 180
      },

      {
        accessorKey: 'LEAVE_REQUEST_FILE_UPLOAD_NAME',
        header: t('File Upload'),
        size: 230,
        enableSorting: false,
        muiTableBodyCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => {
          return (
            <LeaveFileColumn
              fileName={row.original.LEAVE_REQUEST_FILE_UPLOAD_NAME}
              filePath={row.original.LEAVE_REQUEST_FILE_UPLOAD_PATH}
              size='small'
            />
          )
        }
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: t('Employee Name'),
        Cell: ({ row }) => {
          return row.original.EMPLOYEE_NAME + ' ' + row.original.EMPLOYEE_SURNAME
        }
      },
      {
        accessorKey: 'EMPLOYEE_SECTION', // Changed from SECTION_NAME to match SQL Alias
        header: t('Section'),
        size: 150
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_TH', // Changed from _EN to _TH as per SQL/Interface or both if available
        header: t('Leave Type'),
        size: 180
      },
      {
        accessorKey: 'LEAVE_REQUEST_START_DATE', // Changed from REQUEST_LEAVE_DATE
        header: t('Request Leave Date'),
        size: 230,
        Cell: ({ cell }) => formatDate(cell.getValue<string>())
      },
      {
        accessorKey: 'LEAVE_DATE_RANGE',
        header: t('Leave Date'),
        size: 250,
        enableSorting: false,
        Cell: ({ row }) => {
          // Use LEAVE_DATE_RANGE if available, otherwise construct from dates
          if (row.original.LEAVE_DATE_RANGE) {
            return row.original.LEAVE_DATE_RANGE
          }
          // Fallback: construct date range from start and end dates
          const startDate = row.original.LEAVE_REQUEST_START_DATE
          const endDate = row.original.LEAVE_REQUEST_END_DATE
          if (!startDate) return '-'
          const formattedStart = dayjs(startDate).format('DD-MMM-YYYY')
          const formattedEnd = endDate ? dayjs(endDate).format('DD-MMM-YYYY') : formattedStart
          return `${formattedStart} - ${formattedEnd}`
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME', // Changed from LEAVE_TIME
        header: t('Time'),
        size: 100
      },
      {
        accessorKey: 'LEAVE_REQUEST_TOTAL_DAY', // Changed from TOTAL_DAY_LEAVE
        header: t('Total Day Leave'),
        size: 200,
        Cell: ({ cell }) => {
          const value = cell.getValue<number>()
          return value ? value.toFixed(2) : '0.00'
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_REASON', // Changed from REASON
        header: t('Reason'),
        size: 200
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: t('Update Date'),
        size: 170,
        Cell: ({ cell }) => formatDate(cell.getValue<string>())
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Update By'),
        size: 170
      }
    ],
    [t]
  )
  const renderEmptyRowsFallback = () => {
    return (
      <Stack justifyContent='center' alignItems='center' spacing={2} sx={{ py: 10, width: '100%' }}>
        <i className='tabler-file-off' style={{ fontSize: '64px', color: '#E0E0E0' }} />
        <Box textAlign='center'>
          <Typography variant='h6' color='text.secondary'>
            {t('No results found')}
          </Typography>
          <Typography variant='body2' color='text.disabled'>
            {t('Please adjust your filters or Try again.')}
          </Typography>
        </Box>
      </Stack>
    )
  }
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
    <Card sx={{ mt: 4 }}>
      <CardHeader
        title={t('Search result')}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <Stack direction='row' spacing={2} alignItems='center'>
            <Button variant='contained' color='success' onClick={() => setIsExportModalOpen(true)}>
              <img
                width='20'
                height='20'
                src='https://img.icons8.com/color/48/microsoft-excel-2019--v1.png'
                alt='excel'
                className='me-1'
              />
              {t('Export M75')}
            </Button>
            <Button
              variant='tonal'
              onClick={handleCheckAction}
              color='success'
              disabled={selectedRows.length === 0 || isCreatingHrChecker}
              startIcon={<i className='tabler-circle-check' />}
            >
              {t('Check')} ({selectedRows.length})
            </Button>
          </Stack>
        }
      />
      {/* Check Confirmation Modal */}
      <HrCheckM75ConfirmModal
        open={isCheckConfirmModalOpen}
        onClose={() => setIsCheckConfirmModalOpen(false)}
        onConfirm={handleConfirmCheck}
        selectedCount={selectedRows.length}
        isLoading={isCreatingHrChecker}
      />
      {/* Export Modal */}
      <HrCheckM75ExportModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DxMRTTable
          columns={columns}
          data={finalData}
          isError={isError}
          rowCount={totalRecords}
          getRowId={row => String(row.LEAVE_REQUEST_ID)}
          onColumnFiltersChange={setColumnFilters}
          onColumnFilterFnsChange={setColumnFilterFns}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnVisibilityChange={setColumnVisibility}
          onDensityChange={setDensity}
          onColumnPinningChange={setColumnPinning}
          onColumnOrderChange={setColumnOrder}
          onRowSelectionChange={handleMRTRowSelectionChange}
          enableRowSelection={row => !row.original.CHECKED}
          state={{
            columnFilters,
            isLoading: isLoading,
            pagination,
            showAlertBanner: isError,
            sorting,
            density,
            columnVisibility,
            columnPinning,
            columnOrder,
            columnFilterFns,
            rowSelection,
            showProgressBars: isFetching
          }}
          enableRowActions={false}
          manualPagination
          manualSorting
          renderEmptyRowsFallback={renderEmptyRowsFallback}
          enableColumnActions={false}
          enableColumnFilters={false}
          enableDensityToggle={true}
          enableFullScreenToggle={true}
          enableHiding={true}
          displayColumnDefOptions={DISPLAY_COLUMN_OPTIONS}
          muiTableProps={TABLE_PROPS}
        />
      </LocalizationProvider>
    </Card>
  )
}
export default HrcheckM75SearchResult
