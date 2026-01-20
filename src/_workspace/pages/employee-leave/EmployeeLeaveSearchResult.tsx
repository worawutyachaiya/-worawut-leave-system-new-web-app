import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Card, CardHeader, Stack, Typography, useTheme } from '@mui/material'
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
import dayjs from 'dayjs'
import { useUpdateEffect } from 'react-use'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useLeaveEmployeeSearch } from '@/_workspace/react-query/hooks/useLeaveEmployeeLeaveSearch'
import { EmployeeLeaveInterface } from '@/_workspace/types/employee-leave/EmployeeLeaveInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
import { useTranslation } from '@/contexts/TranslationContext'

const EmployeeLeaveSearchResultTable = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const searchFilters = useFormContext<FormDataPage>().watch('searchFilters')
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
  const paramForSearch = {
    EMPLOYEE_CODE: searchFilters?.employeeCode?.EMPLOYEE_CODE || '',
    FULL_NAME: searchFilters?.employeeName?.FULL_NAME || '',
    LEAVE_TYPE_ID: searchFilters?.leaveType?.LEAVE_TYPE_ID || '',
    LEAVE_REQUEST_START_DATE: searchFilters?.startDate
      ? dayjs(searchFilters.startDate).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD'),
    LEAVE_REQUEST_END_DATE: searchFilters?.endDate
      ? dayjs(searchFilters.endDate).format('YYYY-MM-DD')
      : searchFilters?.startDate
        ? dayjs(searchFilters.startDate).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
    EMPLOYEE_SECTION: searchFilters?.section?.SECTION || '',
    EMPLOYEE_DEPT: searchFilters?.department?.DEPARTMENT || '',
    STATUS: '',
    EMPLOYEE_ID: getUserData()?.EMPLOYEE_CODE || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  const { data, isLoading, isError, isFetching, isRefetching } = useLeaveEmployeeSearch(
    paramForSearch,
    isEnableFetching
  )
  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching, setIsEnableFetching])
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])
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
  const tableData = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
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
  const columns = useMemo<MRT_ColumnDef<EmployeeLeaveInterface>[]>(
    () => [
      {
        accessorKey: 'LEAVE_REQUEST_START_DATE',
        header: t('Leave Request Start Date'),
        Cell: ({ row }) => {
          const startDate = row.original?.LEAVE_REQUEST_START_DATE
          const endDate = row.original?.LEAVE_REQUEST_END_DATE
          return (
            <>
              {startDate ? dayjs(startDate).format('DD-MMM-YYYY') : '-'}
              {' ' + t('to') + ' '}
              {endDate ? dayjs(endDate).format('DD-MMM-YYYY') : '-'}
            </>
          )
        }
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: t('Employee Code'),
        size: 180
      },
      {
        accessorKey: 'FULL_NAME',
        header: t('Full Name')
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: t('Employee Section'),
        size: 140
      },
      {
        accessorKey: 'EMPLOYEE_DEPT',
        header: t('Employee Dept'),
        size: 170
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_EN',
        header: t('Leave Type'),
        Cell: ({ row }) => {
          const desc =
            (row.original as any).LEAVE_TYPE_DESCRIPTION_EN || (row.original as any).LEAVE_TYPE_DESCRIPTION_TH || ''
          return desc
        },
        size: 200
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME',
        header: t('Time'),
        size: 150
      }
    ],
    [t]
  )
  return (
    <>
      <Card>
        <CardHeader title={t('Search result')} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            enableRowActions={false}
            data={tableData}
            isError={isError}
            rowCount={totalRecords}
            onColumnFiltersChange={setColumnFilters}
            onColumnFilterFnsChange={setColumnFilterFns}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onColumnVisibilityChange={setColumnVisibility}
            onDensityChange={setDensity}
            onColumnPinningChange={setColumnPinning}
            onColumnOrderChange={setColumnOrder}
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
            muiTableProps={{ sx: { tableLayout: 'auto' } }}
          />
        </LocalizationProvider>
      </Card>
    </>
  )
}
export default EmployeeLeaveSearchResultTable
