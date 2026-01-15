// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// MUI Imports
import { Box, Button, Card, CardHeader, Chip, IconButton, Tooltip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

// MUI Icons
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

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
  useSearchLeaveTypeRegulation,
  useDeleteLeaveTypeRegulation,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useHrLeaveTypeRegulation'
import { useQueryClient } from '@tanstack/react-query'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Local Imports
import type { FormDataPage } from './validationSchema'
import LeaveTypeRegulationAddModal from './modal/LeaveTypeRegulationAddModal'
import LeaveTypeRegulationEditModal from './modal/LeaveTypeRegulationEditModal'
import type { LeaveTypeRegulationData } from './modal/validationSchema'
import ActionsMenu from './components/ActionsMenu'
import DeleteConfirmDialog from './modal/DeleteConfirmDialog'
import { useTranslation } from '@/contexts/TranslationContext'
import { useSettings } from '@/@core/hooks/useSettings'

// Static objects moved outside component for performance //dont delete comment
const DISPLAY_COLUMN_OPTIONS = {
  'mrt-row-actions': {
    muiTableHeadCellProps: { align: 'center' as const },
    muiTableBodyCellProps: { align: 'center' as const }
  }
}
const TABLE_PROPS = { sx: { tableLayout: 'auto' } }

const LeaveTypeSettingSearchResult = () => {
  const { settings } = useSettings()
  const { t } = useTranslation()

  const { control, getValues, setValue } = useFormContext<FormDataPage>()
  const queryClient = useQueryClient()

  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  // Track if this is the first render for initial load
  const isFirstRender = useRef(true)

  // Watch SUBMITTED filters (not searchFilters!)
  const submittedFilters = useFormContext<FormDataPage>().watch('submittedFilters')

  // Modal State - Separate states for Add and Edit
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<LeaveTypeRegulationData | null>(null)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LeaveTypeRegulationData | null>(null)

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
    DEPARTMENT: getValues('searchFilters.department')?.value || '',
    LEAVE_TYPE: getValues('searchFilters.leaveType')?.value || '',
    INUSE: getValues('searchFilters.status')?.value || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  // API Call - Search Leave Type Regulation
  const { data, isLoading, isPending, isError } = useSearchLeaveTypeRegulation(
    paramForSearch,
    isFirstRender.current || isEnableFetching
  )

  // Delete Mutation
  const { mutateAsync: deleteLeaveTypeRegulation, isPending: isDeleting } = useDeleteLeaveTypeRegulation(
    response => {
      if (response.data.Status) {
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        toast.success(response.data.Message || t('Deleted successfully'))
      } else {
        toast.error(response.data.Message || t('Failed to delete'))
      }
    },
    error => {
      toast.error(t('Failed to delete. Please try again.'))
    }
  )

  // Defensive Programming
  const getTableData = (): LeaveTypeRegulationData[] => {
    const resultData = data?.data?.ResultOnDb
    if (Array.isArray(resultData) && resultData.length > 0) {
      // Type assertion to fix TypeScript inference
      return resultData as unknown as LeaveTypeRegulationData[]
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

  // --- Columns Definition ---
  const columns = useMemo<MRT_ColumnDef<LeaveTypeRegulationData>[]>(
    () => [
      {
        accessorKey: 'INUSE',
        header: t('Status'),
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
        accessorFn: row => `${row.LEAVE_TYPE_DESCRIPTION_TH || ''} / ${row.LEAVE_TYPE_DESCRIPTION_EN || ''}`,
        id: 'LEAVE_TYPE',
        header: t('Leave Type')
      },
      {
        accessorKey: 'DEPARTMENT',
        header: t('Department')
      },
      {
        accessorKey: 'LEAVE_TYPE_REQUEST_DAY_BEFORE_USE',
        header: t('Request Leave Day Before Use'),
        size: 350
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Modified By')
      },
      {
        accessorKey: 'MODIFIED_DATE',
        header: t('Modified')
      }
    ],
    [t]
  )

  const handleAddNew = () => {
    setAddModalOpen(true)
  }

  const handleEdit = (row: LeaveTypeRegulationData) => {
    setSelectedData(row)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (row: LeaveTypeRegulationData) => {
    setDeleteTarget(row)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTarget && deleteTarget.LEAVE_TYPE_REGULATION_ID) {
      const userData = getUserData()
      await deleteLeaveTypeRegulation({
        LEAVE_TYPE_REGULATION_ID: deleteTarget.LEAVE_TYPE_REGULATION_ID,
        UPDATE_BY: userData?.EMPLOYEE_CODE || ''
      })
    }
  }

  const handleCloseAddModal = () => {
    setAddModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedData(null)
  }

  return (
    <>
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={t('Search result')}
          action={
            <Button variant='contained' color='success' startIcon={<AddIcon />} onClick={handleAddNew}>
              {t('Add New')}
            </Button>
          }
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            enableRowActions={true}
            positionActionsColumn='first'
            renderRowActions={({ row }) => <ActionsMenu row={row} onEdit={handleEdit} onDelete={handleDeleteClick} />}
            displayColumnDefOptions={DISPLAY_COLUMN_OPTIONS}
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

      <LeaveTypeRegulationAddModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onSubmitSuccess={handleCloseAddModal}
      />

      <LeaveTypeRegulationEditModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        data={selectedData}
        onSubmitSuccess={handleCloseEditModal}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title={t('Delete Leave Type Regulation?')}
        content={t('Are you sure you want to delete this regulation? This action cannot be undone.')}
      />
    </>
  )
}

export default LeaveTypeSettingSearchResult
