import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Card, CardHeader, Chip, IconButton, Tooltip, Box, Typography, Button, Stack } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
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
  MRT_Row,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import { useFormContext } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useSettings } from '@/@core/hooks/useSettings'
import { useSearchHrChecker } from '@/_workspace/react-query/hooks/useHrChecker'
import { useCreateHrChecker } from '@/_workspace/react-query/hooks/useHrChecker'
import { useQueryClient } from '@tanstack/react-query'
import type { FormDataPage } from './validationSchema'
import type { HrCheckerResponseData, HrCheckerSearchParams } from '@/_workspace/types/hr-checker/HrCheckerInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import LeaveFileColumn from './components/LeaveFileColumn'
import TableApprover from './components/TableApprover'
import ExportModal from './components/ExportModal'
import HrCheckConfirmModal from './components/HrCheckConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
function HrCheckerSearchResult() {
  const { settings } = useSettings()
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()
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
  const [rowSelected, setRowSelected] = useState<MRT_Row<HrCheckerResponseData> | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const [isCheckConfirmModalOpen, setIsCheckConfirmModalOpen] = useState<boolean>(false)
  const [selectedRows, setSelectedRows] = useState<{ LEAVE_REQUEST_ID: number; TYPE: string }[]>([])
  const [isPageSelected, setIsPageSelected] = useState<boolean>(false)
  const [isSelectAllData, setIsSelectAllData] = useState<boolean>(false)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()
  const getAllSelectableData = (): { LEAVE_REQUEST_ID: number; TYPE: string }[] => {
    if (Array.isArray(data?.data?.ResultOnDb) && data.data.ResultOnDb.length > 2) {
      const allData = data.data.ResultOnDb[2] as unknown as HrCheckerResponseData[]
      return allData
        .filter(row => row.IS_APPROVER_APPROVED === 1 && row.IS_APPROVED !== 1)
        .map(row => ({
          LEAVE_REQUEST_ID: row.LEAVE_REQUEST_ID,
          TYPE: row.TYPE
        }))
    }
    return []
  }
  const { mutateAsync: createHrChecker, isPending: isCreatingHrChecker } = useCreateHrChecker(
    data => {
      if (data?.data?.Status) {
        ToastMessageSuccess({ message: data.data.Message || t('HR Check completed successfully') })
        setIsCheckConfirmModalOpen(false)
        queryClient.invalidateQueries({
          predicate: query => {
            const queryKey = query.queryKey[0]
            return queryKey === 'HR_CHECKER' || queryKey === 'HR_CHECKER_FOR_EXPORT'
          }
        })
        setIsEnableFetching(true)
        setSelectedRows([])
        setIsPageSelected(false)
        setIsSelectAllData(false)
        setRowSelection({})
      } else {
        ToastMessageError({ message: t(data?.data?.Message || 'HR Check failed') })
      }
    },
    () => {
      ToastMessageError({ message: t('Failed to check HR') })
    }
  )
  const handleCheckAction = async () => {
    if (selectedRows.length === 0) {
      ToastMessageError({ message: t('Please select at least one item') })
      return
    }
    setIsCheckConfirmModalOpen(true)
  }
  const handleConfirmCheck = async () => {
    const payload = {
      rowAction: selectedRows.map(row => ({
        LEAVE_REQUEST_ID: String(row.LEAVE_REQUEST_ID),
        TYPE: row.TYPE
      })),
      approvalBy: getUserData()?.EMPLOYEE_CODE || '',
      totalCount: selectedRows.length
    }
    await createHrChecker(payload)
  }
  const handleSelectPageData = () => {
    const tableData = getTableData()
    const newSelectedRows = tableData
      .filter(row => row.IS_APPROVER_APPROVED === 1 && row.IS_APPROVED !== 1)
      .map(row => ({
        LEAVE_REQUEST_ID: row.LEAVE_REQUEST_ID,
        TYPE: row.TYPE
      }))
    if (newSelectedRows.length === 0) {
      ToastMessageError({ message: t('No selectable items on this page') })
      return
    }
    const mergedRows = [...selectedRows]
    newSelectedRows.forEach(newRow => {
      if (!mergedRows.some(existing => existing.LEAVE_REQUEST_ID === newRow.LEAVE_REQUEST_ID)) {
        mergedRows.push(newRow)
      }
    })
    setSelectedRows(mergedRows)
    setIsPageSelected(true)
    setIsSelectAllData(false)
    const newRowSelection: Record<string, boolean> = { ...rowSelection }
    tableData.forEach((row, index) => {
      if (row.IS_APPROVER_APPROVED === 1 && row.IS_APPROVED !== 1) {
        newRowSelection[String(index)] = true
      }
    })
    setRowSelection(newRowSelection)
    ToastMessageSuccess({ message: `${t('Selected')} ${newSelectedRows.length} ${t('items on this page')}` })
  }
  const handleClearPageData = () => {
    const tableData = getTableData()
    const pageLeaveRequestIds = tableData.map(row => row.LEAVE_REQUEST_ID)
    const remainingRows = selectedRows.filter(row => !pageLeaveRequestIds.includes(row.LEAVE_REQUEST_ID))
    setSelectedRows(remainingRows)
    if (remainingRows.length === 0) {
      setIsPageSelected(false)
      setIsSelectAllData(false)
    } else {
      setIsPageSelected(false)
    }
    const newRowSelection: Record<string, boolean> = {}
    setRowSelection(newRowSelection)
    ToastMessageSuccess({ message: t('Cleared selection on this page') })
  }
  const handleSelectAllData = () => {
    const allSelectableData = getAllSelectableData()
    if (allSelectableData.length === 0) {
      ToastMessageError({ message: t('No selectable items available') })
      return
    }
    setSelectedRows(allSelectableData)
    setIsSelectAllData(true)
    setIsPageSelected(false)
    const newRowSelection: Record<string, boolean> = {}
    allSelectableData.forEach(row => {
      newRowSelection[String(row.LEAVE_REQUEST_ID)] = true
    })
    setRowSelection(newRowSelection)
    ToastMessageSuccess({ message: `${t('Selected all')} ${allSelectableData.length} ${t('items')}` })
  }
  const handleClearAllData = () => {
    setSelectedRows([])
    setIsPageSelected(false)
    setIsSelectAllData(false)
    setRowSelection({})
    ToastMessageSuccess({ message: t('Cleared all selections') })
  }
  const handleMRTRowSelectionChange = (updater: any) => {
    const tableData = getTableData()
    const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater
    setRowSelection(newRowSelection)

    const newSelectedRows: { LEAVE_REQUEST_ID: number; TYPE: string }[] = []

    const preservedRows = selectedRows.filter(row => newRowSelection[String(row.LEAVE_REQUEST_ID)])

    const invalidSelectionIds: string[] = []
    Object.keys(newRowSelection).forEach(id => {
      if (preservedRows.some(r => String(r.LEAVE_REQUEST_ID) === id)) return

      const foundInCurrentPage = tableData.find(row => String(row.LEAVE_REQUEST_ID) === id)
      if (foundInCurrentPage) {
        preservedRows.push({
          LEAVE_REQUEST_ID: foundInCurrentPage.LEAVE_REQUEST_ID,
          TYPE: foundInCurrentPage.TYPE
        })
      }
    })

    setSelectedRows(preservedRows)
    setIsPageSelected(false)
    setIsSelectAllData(false)
  }
  const filters = getValues('searchFilters')
  const paramForSearch: HrCheckerSearchParams = {
    EMPLOYEE_CODE: filters?.employeeCode?.EMPLOYEE_CODE || '',
    LEAVE_TYPE: filters?.leaveType?.LEAVE_TYPE_ID.toString() || '',
    START_DATE: filters?.startDate || dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
    END_DATE: filters?.endDate || dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'),
    STATUS: filters?.status?.value || '',
    STATUS_FOR_APPROVE: filters?.approveStatus?.value || '',
    START: String(pagination.pageIndex * pagination.pageSize) || '0',
    LIMIT: String(pagination.pageSize) || '10',
    ORDER: sorting.length > 0 ? sorting : undefined
  }
  const { data, isLoading, isFetching, isRefetching, isError } = useSearchHrChecker(paramForSearch, isEnableFetching)
  const getTableData = (): HrCheckerResponseData[] => {
    if (Array.isArray(data?.data?.ResultOnDb)) {
      return data.data.ResultOnDb[1] as unknown as HrCheckerResponseData[]
    }
    return []
  }
  const getTotalCount = (): number => {
    if (data?.data?.TotalCountOnDb !== undefined) {
      return data.data.TotalCountOnDb
    }
    if (Array.isArray(data?.data?.ResultOnDb)) {
      return data.data.ResultOnDb.length
    }
    return 0
  }
  useEffect(() => {
    if (isFetching === false) setIsEnableFetching(false)
  }, [isFetching, setIsEnableFetching])
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])
  // const getStatusChip = (status: string) => {
  //   switch (status?.toLowerCase()) {
  //     case 'approved':
  //       return <Chip label={t('Approved')} color='success' size='small' />
  //     case 'rejected':
  //       return <Chip label={t('Rejected')} color='error' size='small' />
  //     case 'pending':
  //       return <Chip label={t('Pending')} color='warning' size='small' />
  //     case 'cancelled':
  //       return <Chip label={t('Cancelled')} color='default' size='small' />
  //     default:
  //       return <Chip label={status || '-'} color='default' size='small' />
  //   }
  // }
  const columns = useMemo<MRT_ColumnDef<HrCheckerResponseData>[]>(
    () => [
      {
        accessorKey: 'STATUS',
        header: t('Approval'),
        size: 150,
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
        enableSorting: false,
        size: 220
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: t('Employee Name'),
        enableSorting: false,
        Cell: ({ row }) => {
          const fullName = `${row.original.EMPLOYEE_NAME || ''} ${row.original.EMPLOYEE_SURNAME || ''}`.trim()
          return fullName || '-'
        }
      },
      {
        enableSorting: false,
        size: 230,
        muiTableBodyCellProps: {
          align: 'center'
        },
        accessorKey: 'LEAVE_REQUEST_FILE_UPLOAD_NAME',
        header: t('File Upload'),
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
        accessorKey: 'EMPLOYEE_SECTION',
        header: t('Section'),
        enableSorting: false,
        size: 180
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_TH',
        header: t('Leave Type'),
        enableSorting: false,
        size: 200
      },
      {
        accessorKey: 'REAL_CREATE_DATE',
        enableSorting: false,
        header: t('Leave request date'),
        Cell: ({ row }) => dayjs(row.original.REAL_CREATE_DATE).format('DD MMM YYYY HH:mm:ss')
      },
      {
        accessorKey: 'UPDATE_DATE',
        enableSorting: false,
        header: t('Update Date'),
        Cell: ({ row }) => dayjs(row.original.UPDATE_DATE).format('DD MMM YYYY HH:mm:ss')
      },
      {
        accessorKey: 'LEAVE_REQUEST_REASON',
        enableSorting: false,
        header: t('Reason')
      },
      {
        accessorKey: 'IN_TIME',
        enableSorting: false,
        header: t('in time'),
        size: 180
      },
      {
        accessorKey: 'OUT_TIME',
        enableSorting: false,
        header: t('out time'),
        size: 180
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME',
        enableSorting: false,
        header: t('Leave Time'),
        size: 180
      },
      {
        accessorKey: 'LEAVE_REQUEST_TOTAL_DAY',
        enableSorting: false,
        header: t('Total Days'),
        size: 200
      },
      {
        accessorKey: 'LEAVE_DATE_RANGE',
        enableSorting: false,
        header: t('Leave Date'),
        Cell: ({ row }) =>
          dayjs(row.original.LEAVE_REQUEST_START_DATE).format('DD MMM YYYY HH:mm') +
          ' - ' +
          dayjs(row.original.LEAVE_REQUEST_END_DATE).format('DD MMM YYYY HH:mm')
      },
      {
        accessorKey: 'CREATE_BY',
        enableSorting: false,
        header: t('Created By'),
        size: 200
      },
      {
        accessorKey: 'UPDATE_BY',
        enableSorting: false,
        header: t('Updated By'),
        size: 200
      },
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
                label='Cancelled'
                color='error'
              />
            )
          }
          const status = cell.getValue<string>()
          const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
            0: { label: t('Pending'), color: 'warning' },
            1: { label: t('Approved'), color: 'success' },
            2: { label: t('Rejected'), color: 'error' }
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
            <Button onClick={() => setIsExportModalOpen(true)} variant='contained' color='success'>
              <img
                width='20'
                height='20'
                src='https://img.icons8.com/color/48/microsoft-excel-2019--v1.png'
                alt='excel'
                className='me-1'
              />
              {t('Export')}
            </Button>
            <Button
              variant='tonal'
              color='info'
              onClick={handleSelectPageData}
              disabled={isSelectAllData}
              startIcon={<i className='tabler-archive' />}
            >
              {t('Select Data')}
            </Button>
            <Button
              variant='tonal'
              color='error'
              onClick={handleClearPageData}
              disabled={isSelectAllData || selectedRows.length === 0}
              startIcon={<i className='tabler-x' />}
            >
              {t('Clear Data')}
            </Button>
            <Button
              variant='tonal'
              color='warning'
              onClick={isSelectAllData ? handleClearAllData : handleSelectAllData}
              disabled={isPageSelected}
              startIcon={<i className={isSelectAllData ? 'tabler-trash' : 'tabler-database'} />}
            >
              {isSelectAllData ? t('Clear All Data') : t('Select All Data')}
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
      {/* Export Modal */}
      <ExportModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} searchParams={paramForSearch} />
      {/* Check Confirmation Modal */}
      <HrCheckConfirmModal
        open={isCheckConfirmModalOpen}
        onClose={() => setIsCheckConfirmModalOpen(false)}
        onConfirm={handleConfirmCheck}
        selectedCount={selectedRows.length}
        isLoading={isCreatingHrChecker}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DxMRTTable
          {...({
            getRowId: (row: any) => String(row.LEAVE_REQUEST_ID),
            autoResetRowSelection: false,
            positionToolbarAlertBanner: 'none'
          } as any)}
          enableRowActions={false}
          columns={columns}
          data={getTableData()}
          rowCount={getTotalCount()}
          onColumnFiltersChange={setColumnFilters}
          onColumnFilterFnsChange={setColumnFilterFns}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnVisibilityChange={setColumnVisibility}
          onDensityChange={setDensity}
          onColumnPinningChange={setColumnPinning}
          onColumnOrderChange={setColumnOrder}
          onRowSelectionChange={handleMRTRowSelectionChange}
          enableRowSelection={row => row.original.IS_APPROVER_APPROVED === 1 && row.original.IS_APPROVED !== 1}
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
          isError={isError}
          displayColumnDefOptions={{
            'mrt-row-actions': {
              muiTableBodyCellProps: {
                align: 'center'
              }
            }
          }}
          muiTableProps={{ sx: { tableLayout: 'auto' } }}
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('View')}>
                <IconButton size='small'>
                  <VisibilityIcon fontSize='small' />
                </IconButton>
              </Tooltip>
              {row.original.STATUS?.toLowerCase() === 'pending' && (
                <Tooltip title={t('Delete')}>
                  <IconButton size='small' color='error' onClick={() => {}}>
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        />
      </LocalizationProvider>
    </Card>
  )
}
export default HrCheckerSearchResult
