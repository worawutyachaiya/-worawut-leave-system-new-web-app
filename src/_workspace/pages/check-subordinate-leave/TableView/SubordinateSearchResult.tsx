import { useEffect, useRef, useState, useMemo } from 'react'
import { Card, CardHeader, Chip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useFormContext } from 'react-hook-form'
import dayjs from 'dayjs'
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
import { useCheckSubordinateLeaveSearch } from '@/_workspace/react-query/hooks/useCheckSubordinateLeave'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from '../validationSchema'
import type { LeaveRecord } from '@/_workspace/types/check-sorbordinate-leave/CheckSubordinateLeaveTypes'
import SubordinateTableApprover from './components/SubordinateTableApprover'
import SubordinateLeaveFileColumn from './components/SubordinateLeaveFileColumn'
function SubordinateSearchResult() {
  const { settings } = useSettings()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue, watch } = useFormContext<FormDataPage>()

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

  const searchFilters = getValues('searchFilters')
  const paramForSearch = {
    EMPLOYEE_CODE: searchFilters?.tableEmployeeCode || '',
    EMPLOYEE_NAME: searchFilters?.tableEmployeeName || '',
    EMPLOYEE_SECTION: searchFilters?.tableSection?.SECTION || '',
    EMPLOYEE_ID_REQUEST: getUserData()?.EMPLOYEE_CODE || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize
  }

  const { data, isLoading, isError, isFetching, isRefetching } = useCheckSubordinateLeaveSearch(
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
  const columns = useMemo<MRT_ColumnDef<LeaveRecord>[]>(
    () => [
      {
        accessorKey: 'LEAVE_REQUEST_STATUS',
        header: 'Status',
        size: 120,
        enableSorting: false,
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const status = row.original.LEAVE_REQUEST_STATUS
          const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
            '0': { label: 'Pending', color: 'warning' },
            '1': { label: 'Approved', color: 'success' },
            '2': { label: 'Rejected', color: 'error' }
          }
          const config = statusConfig[String(status)] || { label: 'Pending', color: 'warning' }
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
        header: 'Approval',
        size: 200,
        enableSorting: false,
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => <SubordinateTableApprover row={row.original} />
      },
      {
        accessorKey: 'LEAVE_REQUEST_FILE_UPLOAD_NAME',
        header: 'File Upload',
        size: 230,
        enableSorting: false,
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          return (
            <SubordinateLeaveFileColumn
              fileName={row.original.LEAVE_REQUEST_FILE_UPLOAD_NAME}
              filePath={row.original.LEAVE_REQUEST_FILE_UPLOAD_PATH}
            />
          )
        }
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: 'Employee ID',
        size: 130
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: 'Employee Name',
        size: 180,
        Cell: ({ row }) => {
          const name = `${row.original.EMPLOYEE_NAME || ''} ${row.original.EMPLOYEE_SURNAME || ''}`
          return name.trim() || '-'
        }
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: 'Section',
        size: 130,
        enableSorting: false
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_TH',
        header: 'Leave Type',
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => row.original.LEAVE_TYPE_DESCRIPTION_TH || row.original.LEAVE_TYPE_DESCRIPTION_EN || '-'
      },
      {
        accessorKey: 'CREATE_DATE',
        header: 'Request Leave Date',
        size: 180,
        Cell: ({ row }) => row.original.CREATE_DATE || '-'
      },
      {
        accessorKey: 'LEAVE_DATE_RANGE',
        header: 'Leave Date',
        size: 220,
        enableSorting: false,
        Cell: ({ row }) => {
          const startDate = row.original.LEAVE_REQUEST_START_DATE
          const endDate = row.original.LEAVE_REQUEST_END_DATE
          const start = startDate ? dayjs(startDate).format('DD-MMM-YYYY') : '-'
          const end = endDate ? dayjs(endDate).format('DD-MMM-YYYY') : '-'
          return `${start} to ${end}`
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME',
        header: 'Time',
        size: 130,
        enableSorting: false,
        Cell: ({ row }) => row.original.LEAVE_REQUEST_TIME || '-'
      },
      {
        accessorKey: 'LEAVE_REQUEST_TOTAL_DAY',
        header: 'Total Day',
        size: 100,
        enableSorting: false,
        muiTableBodyCellProps: { align: 'center' }
      },
      {
        accessorKey: 'LEAVE_REQUEST_REASON',
        header: 'Reason',
        size: 180,
        enableSorting: false,
        Cell: ({ row }) => row.original.LEAVE_REQUEST_REASON || '-'
      },
      {
        accessorKey: 'LEAVE_REQUEST_REMARK',
        header: 'Remark',
        size: 180,
        enableSorting: false,
        Cell: ({ row }) => row.original.LEAVE_REQUEST_REMARK || '-'
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: 'Update Date',
        size: 180,
        Cell: ({ row }) => row.original.UPDATE_DATE || '-'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'Update By',
        size: 120,
        Cell: ({ row }) => row.original.UPDATE_BY || '-'
      }
    ],
    [settings.mode]
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
      <CardHeader title='Search result' />
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
export default SubordinateSearchResult
