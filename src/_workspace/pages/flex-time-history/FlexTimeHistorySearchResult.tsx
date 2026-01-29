import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Card, CardHeader, Chip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useFormContext, useWatch } from 'react-hook-form'
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
  MRT_Row,
  MRT_SortingState,
  MRT_VisibilityState
} from 'material-react-table'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useSettings } from '@/@core/hooks/useSettings'
import { useSearchFlexTimeHistory } from '@/_workspace/react-query/hooks/useFlexTime'
import TableApprover from './components/TableApprover'
import ActionsMenu from './components/ActionsMenu'
import FlexTimeCancelModal from './modal/FlexTimeCancelModal'
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'
import type { FlexTimeRequestData, FlexTimeHistorySearchParams } from '@/_workspace/types/flex-time/FlexTimeInterface'
function FlexTimeHistorySearchResult() {
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const { settings } = useSettings()
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
  const [openCancelModal, setOpenCancelModal] = useState(false)
  const [rowSelected, setRowSelected] = useState<MRT_Row<FlexTimeRequestData> | null>(null)
  const paramForSearch: FlexTimeHistorySearchParams = {
    FLEX_TIME_TYPE_ID: getValues('searchFilters.flexTimeType')?.value || '',
    FLEX_TIME_REQUEST_DATE: getValues('searchFilters.requestDate')
      ? dayjs(getValues('searchFilters.requestDate')).startOf('day').toDate().toString()
      : '',
    START_DATE: getValues('searchFilters.startDate') || '',
    END_DATE: getValues('searchFilters.endDate') || '',
    EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }
  const { data, isLoading, isFetching, isRefetching, isError, refetch } = useSearchFlexTimeHistory(
    paramForSearch,
    isEnableFetching
  )
  const handleCancelRequest = (row: MRT_Row<FlexTimeRequestData>) => {
    setRowSelected(row)
    setOpenCancelModal(true)
  }
  const getTableData = (): FlexTimeRequestData[] => {
    const resultOnDb = data?.data?.ResultOnDb as any
    if (resultOnDb?.[1]) {
      return resultOnDb[1] as FlexTimeRequestData[]
    }
    if (Array.isArray(resultOnDb)) {
      return resultOnDb as FlexTimeRequestData[]
    }
    return []
  }
  const getTotalCount = (): number => {
    const resultOnDb = data?.data?.ResultOnDb as any
    if (resultOnDb?.[0]?.[0]?.TOTAL_COUNT !== undefined) {
      return resultOnDb[0][0].TOTAL_COUNT
    }
    if (data?.data?.TotalCountOnDb !== undefined) {
      return data.data.TotalCountOnDb
    }
    return 0
  }
  useEffect(() => {
    if (isFetching === false) setIsEnableFetching(false)
  }, [isFetching, setIsEnableFetching])
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])
  const getStatusChip = (row: FlexTimeRequestData) => {
    if (row.INUSE === 0 || String(row.INUSE) === '0') {
      return (
        <Chip
          variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
          label={t('Cancelled')}
          color='error'
          size='small'
        />
      )
    }
    const status = row.IS_APPROVER_APPROVED ?? row.FLEX_TIME_REQUEST_STATUS ?? row.IS_APPROVED
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
        accessorKey: 'FLEX_TIME_REQUEST_STATUS',
        header: t('Status'),
        enableSorting: false,
        Cell: ({ row }) => getStatusChip(row.original),
        size: 140
      },
      {
        accessorKey: 'APPROVER',
        header: t('Approval'),
        enableSorting: false,
        Cell: ({ row }) => <TableApprover row={row.original} />,
        size: 150
      },
      {
        accessorKey: 'FLEX_TIME_DESCRIPTION',
        header: t('Time'),
        enableSorting: false,
        size: 140
      },
      {
        accessorKey: 'FLEX_TIME_DATE_RANGE',
        header: t('Flex Time Date'),
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => {
          const startDate = row.original.FLEX_TIME_REQUEST_START_DATE || row.original.START_DATE
          const endDate = row.original.FLEX_TIME_REQUEST_END_DATE || row.original.END_DATE
          if (!startDate || !endDate) return '-'
          const start = dayjs(startDate).format('DD-MMM-YYYY')
          const end = dayjs(endDate).format('DD-MMM-YYYY')
          return start === end ? start : `${start} - ${end}`
        }
      },
      {
        accessorKey: 'CREATE_DATE',
        size: 280,
        header: t('Request Flex Time Date'),
        Cell: ({ row }) => dayjs(row.original.CREATE_DATE).format('DD-MMM-YYYY HH:mm')
      },
      {
        accessorKey: 'UPDATE_DATE',
        size: 200,
        header: t('Update Date'),
        Cell: ({ row }) => dayjs(row.original.UPDATE_DATE).format('DD-MMM-YYYY HH:mm')
      },
      {
        accessorKey: 'UPDATE_BY',
        size: 200,
        header: t('Update By')
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
    <>
      <Card>
        <CardHeader title={t('Search result')} titleTypographyProps={{ variant: 'h5' }} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
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
            isError={isError}
            displayColumnDefOptions={{
              'mrt-row-actions': {
                header: t('ACTIONS'),
                size: 100,
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }
            }}
            muiTableProps={{ sx: { tableLayout: 'auto' } }}
            renderRowActions={({ row }) => (
              <ActionsMenu
                row={row}
                rowSelected={rowSelected}
                setRowSelected={setRowSelected}
                MENU_ID={MENU_ID}
                onCancelRequest={handleCancelRequest}
              />
            )}
          />
        </LocalizationProvider>
      </Card>
      <FlexTimeCancelModal
        open={openCancelModal}
        onClose={() => {
          setOpenCancelModal(false)
          setRowSelected(null)
        }}
        rowData={rowSelected}
        onSuccess={() => refetch()}
      />
    </>
  )
}
export default FlexTimeHistorySearchResult
