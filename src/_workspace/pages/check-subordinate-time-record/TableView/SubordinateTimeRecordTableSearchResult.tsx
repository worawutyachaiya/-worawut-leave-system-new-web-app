import { useEffect, useRef, useState, useMemo } from 'react'
import { Card, CardHeader, Chip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useFormContext } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import type {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_VisibilityState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_ColumnFiltersState,
  MRT_ColumnFilterFnsState
} from 'material-react-table'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useSettings } from '@/@core/hooks/useSettings'
import { useTranslation } from '@/contexts/TranslationContext'
import { useCheckSubordinateTimeRecordSearch } from '@/_workspace/react-query/hooks/useTimeRecordHistorySearch'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from '../validationSchema'
import type { CheckSubordinateTimeRecord } from '@/_workspace/types/check-subordinate-time-record/CheckSubordinateTimeRecordTypes'
import TableApprover from './components/TableApprover'

function SubordinateTimeRecordTableSearchResult() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue } = useFormContext<FormDataPage>()

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

  const userData = getUserData()
  const searchFilters = getValues('searchFilters')
  const paramForSearch = {
    EMPLOYEE_CODE: searchFilters?.tableEmployeeCode || '',
    EMPLOYEE_NAME: searchFilters?.tableEmployeeName || '',
    EMPLOYEE_SECTION: searchFilters?.tableSection?.SECTION || '',
    EMPLOYEE_ID_REQUEST: userData?.EMPLOYEE_CODE || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  const { data, isLoading, isError, isFetching, isRefetching } = useCheckSubordinateTimeRecordSearch(
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
    const rawResult = data?.data?.ResultOnDb
    if (Array.isArray(rawResult)) {
      if (Array.isArray(rawResult[1])) {
        return rawResult[1]
      }
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

  const columns = useMemo<MRT_ColumnDef<CheckSubordinateTimeRecord>[]>(
    () => [
      {
        accessorKey: 'TIME_RECORD_REQUEST_STATUS',
        header: t('Status'),
        size: 120,
        enableSorting: false,
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const status = row.original.TIME_RECORD_REQUEST_STATUS
          const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
            '0': { label: t('Pending'), color: 'warning' },
            '1': { label: t('Approved'), color: 'success' },
            '2': { label: t('Rejected'), color: 'error' }
          }
          const config = statusConfig[String(status)] || { label: t('Pending'), color: 'warning' }
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
        size: 140,
        enableSorting: false,
        Cell: ({ row }) => <TableApprover row={row.original} />
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: t('Employee Code'),
        size: 160
      },
      {
        accessorKey: 'EMPLOYEE_FULL_NAME',
        header: t('Employee Name'),
        enableSorting: false,
        Cell: ({ row }) => {
          const name =
            row.original.EMPLOYEE_FULL_NAME ||
            `${row.original.EMPLOYEE_NAME || ''} ${row.original.EMPLOYEE_SURNAME || ''}`
          return name.trim() || '-'
        }
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: t('Section'),
        size: 150,
        enableSorting: false
      },
      {
        accessorKey: 'CREATE_DATE',
        header: t('Request Leave Date'),
        size: 230,
        Cell: ({ row }) => row.original.CREATE_DATE || '-'
      },
      {
        accessorKey: 'IN_TIME',
        header: t('in time'),
        size: 220,
        enableSorting: false,
        Cell: ({ row }) => row.original.IN_TIME || '-'
      },
      {
        accessorKey: 'OUT_TIME',
        header: t('out time'),
        size: 220,
        enableSorting: false,
        Cell: ({ row }) => row.original.OUT_TIME || '-'
      },
      {
        accessorKey: 'TIME_RECORD_TYPE_DESCRIPTION',
        header: t('Reason'),
        enableSorting: false,
        Cell: ({ row }) => row.original.TIME_RECORD_TYPE_DESCRIPTION || '-'
      },
      {
        accessorKey: 'TIME_RECORD_REASON',
        header: t('Description'),
        enableSorting: false,
        Cell: ({ row }) => row.original.TIME_RECORD_REASON || '-'
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: t('Update Date'),
        size: 200,
        Cell: ({ row }) => row.original.UPDATE_DATE || '-'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Update By'),
        size: 140,
        Cell: ({ row }) => row.original.UPDATE_BY || '-'
      }
    ],
    [settings.mode, t]
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
  useEffect(() => {
    if (!isFirstRender.current) setValue('searchResults.pageSize', pagination.pageSize)
  }, [setValue, pagination.pageSize])

  return (
    <Card>
      <CardHeader title={t('Search result')} titleTypographyProps={{ variant: 'h5' }} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DxMRTTable
          enableRowActions={false}
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
            columnFilterFns
          }}
          onColumnFiltersChange={setColumnFilters}
          onColumnFilterFnsChange={setColumnFilterFns}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onColumnVisibilityChange={setColumnVisibility}
          onDensityChange={setDensity}
          onColumnPinningChange={setColumnPinning}
          onColumnOrderChange={setColumnOrder}
          manualPagination
          manualSorting
          enableColumnOrdering
          enableColumnActions={false}
          enableColumnFilters={false}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
        />
      </LocalizationProvider>
    </Card>
  )
}

export default SubordinateTimeRecordTableSearchResult
