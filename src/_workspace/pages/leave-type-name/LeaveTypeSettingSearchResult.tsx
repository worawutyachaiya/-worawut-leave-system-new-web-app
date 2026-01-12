import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from '@/contexts/TranslationContext'
import { Card, CardHeader, Chip, IconButton, Tooltip, Box } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useFormContext, useWatch } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
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
import {
  useSearchLeaveType,
  useDeleteLeaveType,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useLeaveTypeSetting'
import type { FormDataPage } from './validationSchema'
import type { LeaveTypeData } from '@/_workspace/types/leave-type-setting/LeaveTypeSettingInterface'

// Static objects moved outside component for performance //dont delete comment
const DISPLAY_COLUMN_OPTIONS = {
  'mrt-row-actions': {
    muiTableBodyCellProps: {
      align: 'center' as const
    }
  }
}
const TABLE_PROPS = { sx: { tableLayout: 'auto' } }

function LeaveTypeSettingSearchResult() {
  const { t } = useTranslation()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const queryClient = useQueryClient()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()
  useWatch({ control, name: 'searchFilters' })
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    () => getValues('searchResults.columnVisibility') || {}
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(
    () => getValues('searchResults.columnOrder') || []
  )
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(
    () => getValues('searchResults.columnPinning') || {}
  )
  const [density, setDensity] = useState<MRT_DensityState>(
    () => getValues('searchResults.density') || 'comfortable'
  )
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    () => getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(
    () => getValues('searchResults.sorting') || []
  )
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    () => getValues('searchResults.columnFilterFns') || {}
  )
  const [pagination, setPagination] = useState<MRT_PaginationState>(() => ({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  }))
  const [rowSelected, setRowSelected] = useState<MRT_Row<LeaveTypeData> | null>(null)
  const paramForSearch = {
    LEAVE_TYPE_CODE: getValues('searchFilters.leaveTypeCode') || '',
    LEAVE_TYPE_DESCRIPTION: getValues('searchFilters.leaveTypeDescription') || '',
    STATUS: getValues('searchFilters.status') || '',
    Start: String(pagination.pageIndex * pagination.pageSize),
    Limit: String(pagination.pageSize),
    Order: sorting.length > 0 ? sorting : undefined
  }
  const { data, isLoading, isFetching, isRefetching, isError } = useSearchLeaveType(paramForSearch, isEnableFetching)
  const { mutateAsync: deleteLeaveType } = useDeleteLeaveType(
    (response) => {
      if (response && response.data && response.data.Status === true) {
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        toast.success(response.data.Message || 'Deleted successfully')
      } else {
        toast.error(response?.data?.Message || 'Failed to delete')
      }
    },
    (error) => {
      console.error('Delete error:', error)
      toast.error('Failed to delete. Please try again.')
    }
  )
  const getTableData = (): LeaveTypeData[] => {
    if (Array.isArray(data?.data?.ResultOnDb)) {
      return data.data.ResultOnDb as unknown as LeaveTypeData[]
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

  const handleDelete = async (row: LeaveTypeData) => {
    if (window.confirm(t('Are you sure you want to delete this request?'))) {
      await deleteLeaveType(row.LEAVE_TYPE_ID)
    }
  }
  const columns = useMemo<MRT_ColumnDef<LeaveTypeData>[]>(
    () => [
      {
        accessorKey: 'SECT_NAME',
        header: t('Section')
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: t('Employee Code')
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: t('Employee Name')
      },
      {
        accessorKey: 'FLEX_TIME_DESCRIPTION',
        header: t('Flex Time Type')
      },
      {
        accessorKey: 'START_DATE',
        header: t('Start Date'),
        Cell: ({ row }) => dayjs(row.original.START_DATE).format('DD-MMM-YYYY')
      },
      {
        accessorKey: 'END_DATE',
        header: t('End Date'),
        Cell: ({ row }) => dayjs(row.original.END_DATE).format('DD-MMM-YYYY')
      },
      {
        accessorKey: 'REASON',
        header: t('Reason')
      }
    ],
    [t]  // Re-create columns when language changes //dont delete comment
  )
  // Sync MRT state to React Hook Form (for DxWatchSearchFilters to save) //dont delete comment
  useUpdateEffect(() => {
    setValue('searchResults.columnFilters', columnFilters)
    setValue('searchResults.sorting', sorting)
    setValue('searchResults.density', density)
    setValue('searchResults.columnVisibility', columnVisibility)
    setValue('searchResults.columnPinning', columnPinning)
    setValue('searchResults.columnOrder', columnOrder)
    setValue('searchResults.columnFilterFns', columnFilterFns)
    setValue('searchResults.pageSize', pagination.pageSize)
  }, [columnFilters, sorting, density, columnVisibility, columnPinning, columnOrder, columnFilterFns, pagination.pageSize])

  return (
    <Card>
      <CardHeader title={t('Leave Type Results')} titleTypographyProps={{ variant: 'h5' }} />
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
          displayColumnDefOptions={DISPLAY_COLUMN_OPTIONS}
          muiTableProps={TABLE_PROPS}
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('View')}>
                <IconButton size='small'>
                  <VisibilityIcon fontSize='small' />
                </IconButton>
              </Tooltip>
              {row.original.STATUS?.toLowerCase() === 'pending' && (
                <Tooltip title={t('Delete')}>
                  <IconButton size='small' color='error' onClick={() => handleDelete(row.original)}>
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
export default LeaveTypeSettingSearchResult
