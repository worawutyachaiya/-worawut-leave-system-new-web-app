import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import { useDxContext } from '@/_template/DxContextProvider'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useLeaveHistorySearch } from '@/_workspace/react-query/hooks/useLeaveHistorySearch'
import { LeaveHistoryInterface, LeaveHistorySearchParams } from '@/_workspace/types/leave-history/LeaveHistoryInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import ActionsMenu from './components/ActionsMenu'
import LeaveFileColumn from './components/LeaveFileColumn'
import LeaveFileUploadModal from './modal/LeaveFileUploadModal'
import LeaveCancelModal from './modal/LeaveCancelModal'
import TableApprover from './components/TableApprover'
import type { FormDataPage } from './validationSchema'
import { MENU_ID } from './env'
import { useTranslation } from '@/contexts/TranslationContext'
function SearchResult() {
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { settings } = useSettings()
  const checkPermission = useCheckPermission()
  const [rowSelected, setRowSelected] = useState<MRT_Row<LeaveHistoryInterface> | null>(null)
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
  const [openFileUploadModal, setOpenFileUploadModal] = useState<boolean>(false)
  const [selectedRowForUpload, setSelectedRowForUpload] = useState<LeaveHistoryInterface | null>(null)
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false)
  const handleOpenUploadModal = (rowData: LeaveHistoryInterface) => {
    setSelectedRowForUpload(rowData)
    setOpenFileUploadModal(true)
  }
  const handleCancelRequest = (row: MRT_Row<LeaveHistoryInterface>) => {
    setRowSelected(row)
    setOpenCancelModal(true)
  }
  const { t } = useTranslation()
  const paramForSearch: LeaveHistorySearchParams = {
    LEAVE_REQUEST_DATE: getValues('searchFilters.requestDate')
      ? dayjs(getValues('searchFilters.requestDate')).startOf('day').toDate().toString()
      : '',
    LEAVE_TYPE_CODE: getValues('searchFilters.leaveType')?.LEAVE_TYPE_CODE || '',
    INUSE: '',
    EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || '',
    Start: String(pagination.pageIndex * pagination.pageSize),
    Limit: String(pagination.pageSize),
    Order: sorting.length > 0 ? sorting : undefined
  }
  const { isRefetching, isLoading, data, isError, isFetching, refetch } = useLeaveHistorySearch(
    paramForSearch,
    isEnableFetching
  )
  const getTableData = (): LeaveHistoryInterface[] => {
    if (data?.data?.ResultOnDb?.[1]) {
      return data.data.ResultOnDb[1] as LeaveHistoryInterface[]
    }
    if (Array.isArray(data?.data?.ResultOnDb)) {
      return data.data.ResultOnDb as LeaveHistoryInterface[]
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
  const columns = useMemo<MRT_ColumnDef<LeaveHistoryInterface>[]>(
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
        accessorKey: 'LEAVE_REQUEST_FILE_UPLOAD_PATH',
        header: 'Attachment',
        size: 175,
        enableSorting: false,
        muiTableBodyCellProps: {
          align: 'center'
        },
        Cell: ({ row }) => {
          return (
            <LeaveFileColumn
              fileName={row.original.LEAVE_REQUEST_FILE_UPLOAD_NAME}
              filePath={row.original.LEAVE_REQUEST_FILE_UPLOAD_PATH}
              onClickUpload={() => handleOpenUploadModal(row.original)}
              showUploadButton={true}
            />
          )
        }
      },
      {
        accessorKey: 'LEAVE_TYPE_CODE',
        header: 'Leave Code',
        size: 185
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_TH',
        header: 'Leave Type',
        size: 185
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
        accessorKey: 'LEAVE_DATE_RANGE',
        header: 'Leave Date',
        size: 180,
        enableSorting: false
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME',
        header: 'Time',
        size: 150,
        enableSorting: false
      },
      {
        accessorKey: 'LEAVE_REQUEST_TOTAL_DAY',
        header: 'Total Day',
        size: 185
      },
      {
        accessorKey: 'LEAVE_REQUEST_REASON',
        header: 'Reason',
        size: 200,
        enableSorting: false
      },
      {
        accessorKey: 'LEAVE_REQUEST_REMARK',
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
        <CardHeader title={t('Leave History Result')} />
        <LeaveFileUploadModal
          leaveFileUploadId={String(selectedRowForUpload?.LEAVE_REQUEST_FILE_UPLOAD_ID || '')}
          open={openFileUploadModal}
          onClose={() => {
            setOpenFileUploadModal(false)
            setSelectedRowForUpload(null)
          }}
          leaveRequestId={String(selectedRowForUpload?.LEAVE_REQUEST_ID || '')}
          existingFileName={selectedRowForUpload?.LEAVE_REQUEST_FILE_UPLOAD_NAME}
          onSuccess={() => {
            refetch()
          }}
        />
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
      <LeaveCancelModal
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
