import { useEffect, useRef, useState, useMemo } from 'react'
import { Button, Card, CardHeader, Chip, Stack } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useFormContext } from 'react-hook-form'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
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
import { useSearchFlexTimeHrChecker } from '@/_workspace/react-query/hooks/useFlexTime'
import type { FormDataPage } from '../validationSchema'
import type { SubordinateFlexTime } from '@/_workspace/types/subordinate-flex-time/SubordinateFlexTimeTypes'
import TableApprover from './components/TableApprover'
import ExportModal from './components/ExportModal'

function SubordinateFlexTimeTableSearchResult() {
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
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

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  const searchFilters = getValues('searchFilters')

  // HR Check: Use search filters from Search form (Employee Code, Start Date, End Date)
  // Format Date objects to string for API
  const formatDateForApi = (date: any) => {
    if (!date) return null
    if (date instanceof Date) return dayjs(date).format('YYYY-MM-DD')
    if (typeof date === 'string') return dayjs(date).format('YYYY-MM-DD')
    return null
  }

  const paramForSearch = {
    EMPLOYEE_CODE:
      searchFilters?.tableEmployeeCode?.EMPLOYEE_ID || searchFilters?.tableEmployeeCode?.EMPLOYEE_CODE || '',
    START_DATE:
      formatDateForApi(searchFilters?.tableStartDate) ||
      dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
    END_DATE:
      formatDateForApi(searchFilters?.tableEndDate) || dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'),
    STATUS: '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  const { data, isLoading, isError, isFetching, isRefetching } = useSearchFlexTimeHrChecker(
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
    let result: any[] = []
    if (Array.isArray(rawResult)) {
      if (Array.isArray(rawResult[1])) {
        result = rawResult[1]
      } else {
        result = rawResult
      }
    }
    // Backend already calculates APPROVER and FLEX_TIME_REQUEST_STATUS
    return result
  }, [data])

  const totalRecords = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    if (Array.isArray(rawResult) && Array.isArray(rawResult[0]) && rawResult[0][0]?.TOTAL_COUNT) {
      return rawResult[0][0].TOTAL_COUNT
    }
    return data?.data?.TotalCountOnDb || 0
  }, [data])

  const columns = useMemo<MRT_ColumnDef<SubordinateFlexTime>[]>(
    () => [
      {
        accessorKey: 'FLEX_TIME_REQUEST_STATUS',
        header: t('Status'),
        size: 120,
        enableSorting: false,
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const status = row.original.FLEX_TIME_REQUEST_STATUS
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
        enableSorting: false,
        Cell: ({ row }) => <TableApprover row={row.original} />,
        size: 140
      },
      {
        accessorKey: 'FLEX_TIME_REQUEST_EMPLOYEE_CODE',
        header: t('Employee Code'),
        // enableSorting: false,
        size: 200
      },
      {
        accessorKey: 'EMPLOYEE_FULL_NAME',
        header: t('Employee Name'),
        enableSorting: false
      },
      {
        accessorKey: 'FLEX_TIME_DESCRIPTION',
        header: t('Time'),
        enableSorting: false,
        size: 140
      },
      {
        accessorKey: 'FLEX_TIME_REQUEST_START_DATE',
        header: t('Flex Time Date'),
        enableSorting: false,
        Cell: ({ row }) =>
          `${dayjs(row.original.FLEX_TIME_REQUEST_START_DATE).format('DD MMM YYYY')}  ${t('to')}  ${dayjs(row.original.FLEX_TIME_REQUEST_END_DATE).format('DD MMM YYYY')}` ||
          '-'
      },
      {
        accessorKey: 'CREATE_DATE',
        header: t('Request Flex Time Date'),
        Cell: ({ row }) => dayjs(row.original.CREATE_DATE).format('DD MMM YYYY') || '-',
        size: 250
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: t('Update Date'),
        Cell: ({ row }) => dayjs(row.original.UPDATE_DATE).format('DD MMM YYYY') || '-',
        size: 180
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Update By'),
        // enableSorting: false,
        size: 160
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
          </Stack>
        }
      />
      <ExportModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} searchParams={paramForSearch} />
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

export default SubordinateFlexTimeTableSearchResult
