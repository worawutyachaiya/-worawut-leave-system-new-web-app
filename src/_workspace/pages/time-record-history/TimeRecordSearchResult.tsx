import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Button, Card, CardHeader, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
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
import { useDxContext } from '@/_template/DxContextProvider'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import { useTimeRecordHistorySearch } from '@/_workspace/react-query/hooks/useTimeRecordHistorySearch'
import { TimeRecordHistoryInterface, TimeRecordSearchParams } from '@/_workspace/types/time-record/TimeRecordInterface'
import ActionsMenu from './components/ActionsMenu'
import TableApprover from './components/TableApprover'
import TimeRecordCancelModal from './modal/TimeRecordDeleteModal'
import { MENU_ID } from './env'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
function SearchResult() {
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { settings } = useSettings()
  const checkPermission = useCheckPermission()
  const [rowSelected, setRowSelected] = useState<MRT_Row<TimeRecordHistoryInterface> | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    getValues('searchResults.columnVisibility')
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize')
  })
  const [selectedRowForUpload, setSelectedRowForUpload] = useState<TimeRecordHistoryInterface | null>(null)
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false)
  const handleCancelRequest = (row: MRT_Row<TimeRecordHistoryInterface>) => {
    setRowSelected(row)
    setOpenCancelModal(true)
  }
  const { t } = useTranslation()
  const paramForSearch: TimeRecordSearchParams = {
    REQUEST_DATE: getValues('searchFilters.requestDate')
      ? dayjs(getValues('searchFilters.requestDate')).startOf('day').toDate().toString()
      : '',
    EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || '',
    Start: String(pagination.pageIndex * pagination.pageSize),
    Limit: String(pagination.pageSize),
    Order: sorting.length > 0 ? sorting : undefined
  }
  const { isRefetching, isLoading, data, isError, isFetching, refetch } = useTimeRecordHistorySearch(
    paramForSearch,
    isEnableFetching
  )
  const getTableData = (): TimeRecordHistoryInterface[] => {
    if (data?.data?.ResultOnDb) {
      return data.data.ResultOnDb[1] as TimeRecordHistoryInterface[]
    }
    if (Array.isArray(data?.data?.ResultOnDb)) {
      return data.data.ResultOnDb[1] as TimeRecordHistoryInterface[]
    }
    return []
  }
  const getTotalCount = (): number => {
    if (data?.data?.ResultOnDb?.[0]?.[0] && 'TOTAL_COUNT' in data.data.ResultOnDb[0][0]) {
      return (data.data.ResultOnDb[0][0] as any).TOTAL_COUNT
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
  const columns = useMemo<MRT_ColumnDef<TimeRecordHistoryInterface>[]>(
    () => [
      {
        accessorKey: 'LEAVE_REQUEST_STATUS',
        header: 'Status',
        size: 155,
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
            0: { label: 'Pending', color: 'warning' },
            1: { label: 'Approved', color: 'success' },
            2: { label: 'Rejected', color: 'error' }
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
      },
      {
        accessorKey: 'APPROVER',
        header: 'Approval',
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => {
          return <TableApprover row={row.original} />
        }
      },
      {
        accessorKey: 'CREATE_DATE',
        header: 'Request Date',
        size: 205,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>()
          return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'
        }
      },
      {
        accessorKey: 'IN_TIME',
        header: 'IN',
        size: 180,
        enableSorting: false
      },
      {
        accessorKey: 'OUT_TIME',
        header: 'OUT',
        size: 150,
        enableSorting: false
      },
      {
        accessorKey: 'TIME_RECORD_TYPE_DESCRIPTION',
        header: 'Reason',
        size: 200,
        enableSorting: false
      },
      {
        accessorKey: 'REMARK',
        header: 'Remark',
        size: 200,
        enableSorting: false
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: 'Update Date',
        size: 195,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>()
          return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'
        }
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'Update By',
        size: 180
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
  return (
    <>
      <Card>
        <CardHeader
          title={t('Time Record History Result')}
        />
        {/* Modal Area (ถ้ามี) */}
        {/* {openModalAdd && <LeaveHistoryModal openModal={openModalAdd} setOpenModal={setOpenModalAdd} mode='Add' />} */}
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
                size: 80, 
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }
            }}
            renderRowActions={({ row }) => (
              <ActionsMenu
                row={row}
                rowSelected={rowSelected}
                setRowSelected={setRowSelected}
                isNeedEditDelete={true}
                MENU_ID={MENU_ID}
                onCancelRequest={handleCancelRequest}
              />
            )}
          />
        </LocalizationProvider>
      </Card>
      {/* Cancel Leave Request Modal */}
      <TimeRecordCancelModal
        open={openCancelModal}
        onClose={() => {
          setOpenCancelModal(false)
          setRowSelected(null)
        }}
        rowData={rowSelected}
        onSuccess={() => {
          refetch()
        }}
      />
    </>
  )
}
export default SearchResult
