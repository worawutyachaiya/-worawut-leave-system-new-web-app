// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// MUI Imports
import { Box, Button, Card, CardHeader, Chip, IconButton, Tooltip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

// MUI Icons
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

// Material React Table Imports
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

// React Hook Form Imports
import { useFormContext } from 'react-hook-form'

// Third-party Imports
import { useUpdateEffect } from 'react-use'
import { toast } from 'react-toastify'

// _template Imports
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'

// Hooks Imports
import {
  useSearchLeaveType,
  useDeleteLeaveType,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useHrLeaveTypeName'

// Local Imports
import type { FormDataPage } from './validationSchema'
import LeaveTypeEditModal from './modal/LeaveTypeEditModal'
import DeleteConfirmDialog from './modal/DeleteConfirmDialog'
import ActionsMenu from './components/ActionsMenu'
import type { LeaveTypeData } from './modal/validationSchema'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '@/contexts/TranslationContext'
import { useSettings } from '@/@core/hooks/useSettings'

import dayjs from 'dayjs'
import 'dayjs/locale/th'
// Static objects moved outside component for performance //dont delete comment
const TABLE_PROPS = { sx: { tableLayout: 'auto' } }

const LeaveTypeSearchResult = () => {
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const { settings } = useSettings()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()
  const queryClient = useQueryClient()

  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  // Track if this is the first render for initial load
  const isFirstRender = useRef(true)

  // Watch SUBMITTED filters from form (not searchFilters)
  const submittedFilters = useFormContext<FormDataPage>().watch('submittedFilters')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<LeaveTypeData | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LeaveTypeData | null>(null)

  // #region States : MRT
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    () => getValues('searchResults.columnVisibility') || {}
  )
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([])
  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(
    () => getValues('searchResults.columnPinning') || {}
  )
  const [density, setDensity] = useState<MRT_DensityState>(() => getValues('searchResults.density') || 'comfortable')
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    () => getValues('searchResults.columnFilters') || []
  )
  const [sorting, setSorting] = useState<MRT_SortingState>(() => getValues('searchResults.sorting') || [])
  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    () => getValues('searchResults.columnFilterFns') || {}
  )
  const [pagination, setPagination] = useState<MRT_PaginationState>(() => ({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize') || 10
  }))
  // #endregion

  // Build search params using getValues
  const paramForSearch = {
    LEAVE_TYPE_CODE: getValues('searchFilters.leaveTypeCode') || '',
    LEAVE_TYPE_DESCRIPTION_EN: getValues('searchFilters.leaveTypeName') || '',
    INUSE: getValues('searchFilters.status')?.value || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  // API Call - Enable on first render (initial load) OR when isEnableFetching is true
  const { data, isLoading, isPending, isError } = useSearchLeaveType(
    paramForSearch,
    isFirstRender.current || isEnableFetching // Enable on mount OR when Search is clicked
  )

  // Delete Mutation
  const onDeleteSuccess = (response: any) => {
    if (response.data.Status) {
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      toast.success(response.data.Message || t('Deleted successfully'))
    } else {
      toast.error(response.data.Message || t('Failed to delete'))
    }
  }

  const onDeleteError = () => {
    toast.error(t('Failed to delete. Please try again.'))
  }

  const { mutateAsync: deleteLeaveType, isPending: isDeleting } = useDeleteLeaveType(onDeleteSuccess, onDeleteError)

  // Defensive Programming
  const getTableData = (): LeaveTypeData[] => {
    const resultData = data?.data?.ResultOnDb
    if (Array.isArray(resultData) && resultData.length > 0) {
      // Type assertion to fix TypeScript inference
      return resultData as unknown as LeaveTypeData[]
    }
    return []
  }

  const getTotalCount = (): number => {
    return data?.data?.TotalCountOnDb || 0
  }

  const tableData = getTableData()
  const totalCount = getTotalCount()
  const isActionPending = isLoading || isDeleting
  const isShowLoading = isPending

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  // Reset isEnableFetching after fetch completes
  useEffect(() => {
    if (isPending === false) {
      setIsEnableFetching(false)
    }
  }, [isPending, setIsEnableFetching])

  // Trigger search when pagination/sorting changes
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([sorting, pagination])])

  // Sync MRT state to React Hook Form (for DxWatchSearchFilters to save)
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

  // --- Columns  ---
  const columns = useMemo<MRT_ColumnDef<LeaveTypeData>[]>(
    () => [
      {
        accessorKey: 'INUSE',
        header: t('Status'),
        size: 140,
        enableSorting: false,
        Cell: ({ row }) => {
          const inuse = row.original.INUSE
          return (
            <Chip
              variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
              size='small'
              label={inuse === 1 ? t('Active') : t('Cancel')}
              color={inuse === 1 ? 'success' : 'error'}
            />
          )
        }
      },
      {
        accessorKey: 'LEAVE_TYPE_CODE',
        size: 200,
        enableSorting: false,

        header: t('Leave Type Code')
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_EN',
        enableSorting: false,
        header: t('Leave Type Name')
      },
      {
        accessorKey: 'LEAVE_TYPE_REQUEST_DAY_BEFORE_USE',
        header: t('Request Day Before Use')
      },
      {
        accessorKey: 'MODIFIED_DATE',
        header: t('Modified Date'),
        size: 210,
        Cell: ({ row }) => dayjs(row.original.MODIFIED_DATE).format('DD-MMM-YYYY HH:mm')
      },
      {
        accessorKey: 'UPDATE_BY',
        size: 190,
        header: t('Modified By')
      }
    ],
    [t]
  )

  const handleEdit = (row: LeaveTypeData) => {
    setSelectedData(row)
    setIsEditMode(true)
    setModalOpen(true)
  }

  const handleDeleteClick = (row: LeaveTypeData) => {
    setDeleteTarget(row)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTarget && deleteTarget.LEAVE_TYPE_ID) {
      const userData = getUserData()
      await deleteLeaveType({
        LEAVE_TYPE_ID: deleteTarget.LEAVE_TYPE_ID,
        UPDATE_BY: userData?.EMPLOYEE_CODE // Using actual user code
      })
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedData(null)
  }

  return (
    <>
      <Card sx={{ mt: 4 }}>
        <CardHeader title={t('Search result')} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            enableRowActions={true}
            positionActionsColumn='first'
            renderRowActions={({ row }) => <ActionsMenu row={row} onEdit={handleEdit} onDelete={handleDeleteClick} />}
            displayColumnDefOptions={{
              'mrt-row-actions': {
                header: t('ACTIONS'),
                size: 100,
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }
            }}
            data={tableData}
            isError={isError}
            rowCount={totalCount}
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
              isLoading: isActionPending,
              pagination,
              showAlertBanner: isError,
              showProgressBars: isShowLoading,
              sorting,
              density,
              columnVisibility,
              columnPinning,
              columnOrder,
              columnFilterFns
            }}
            muiTableProps={TABLE_PROPS}
          />
        </LocalizationProvider>
      </Card>

      <LeaveTypeEditModal
        open={modalOpen}
        onClose={handleCloseModal}
        data={selectedData}
        isEditMode={isEditMode}
        onSubmitSuccess={handleCloseModal}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title={t('Delete Leave Type?')}
        content={t('Are you sure you want to delete this leave type? This action cannot be undone.')}
      />
    </>
  )
}

export default LeaveTypeSearchResult
