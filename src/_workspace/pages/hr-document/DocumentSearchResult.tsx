import { useEffect, useMemo, useRef, useState } from 'react'

import { Box, Button, Card, CardHeader, Chip, Tooltip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import AddIcon from '@mui/icons-material/Add'

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
import 'dayjs/locale/th'
import { useUpdateEffect } from 'react-use'
import { toast } from 'react-toastify'

import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'

import { useSearchDocument, useDeleteDocument } from '@/_workspace/react-query/hooks/useHrDocument'
import { useQueryClient } from '@tanstack/react-query'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import type { FormDataPage } from './validationSchema'
import AddDocumentModal from './modal/AddDocumentModal'
import DeleteConfirmDialog from './modal/DeleteConfirmDialog'
import type { DocumentData } from './modal/validationSchema'
import ActionsMenu from './components/ActionsMenu'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrDocument'
import { useSettings } from '@/@core/hooks/useSettings'
import { useTranslation } from '@/contexts/TranslationContext'

// Static objects moved outside component for performance //dont delete comment

const TABLE_PROPS = { sx: { tableLayout: 'auto' } }

const DocumentSearchResult = () => {
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const { settings } = useSettings()

  const { control, getValues, setValue } = useFormContext<FormDataPage>()

  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const queryClient = useQueryClient()

  // Watch SUBMITTED filters (not searchFilters!)
  const submittedFilters = useFormContext<FormDataPage>().watch('submittedFilters')

  // Track first render
  const isFirstRender = useRef(true)

  // Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<DocumentData | null>(null)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DocumentData | null>(null)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

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
    LEAVE_REGULARITY_NAME: getValues('searchFilters.documentName') || '',
    INUSE: getValues('searchFilters.status')?.value || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  // API Call
  const { data, isFetching, isError } = useSearchDocument(paramForSearch, isFirstRender.current || isEnableFetching)

  // Reset isEnableFetching after fetch completes
  useEffect(() => {
    if (!isFetching && isEnableFetching) {
      setIsEnableFetching(false)
    }
  }, [isFetching, isEnableFetching, setIsEnableFetching])

  // Handle pagination/sorting changes
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [pagination.pageIndex, pagination.pageSize, sorting])

  // Sync MRT state to React Hook Form for DxWatchSearchFilters to save
  // Separated useEffect for each state to prevent unnecessary setValue calls
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

  // --- Handler Functions ---
  const handleAddNew = () => {
    setSelectedData(null)
    setModalOpen(true)
  }

  const handleDeleteClick = (rowData: DocumentData) => {
    setDeleteTarget(rowData)
    setDeleteDialogOpen(true)
  }

  // Delete Document Mutation
  const { mutateAsync: deleteDocument, isPending } = useDeleteDocument(
    onSuccess => {
      if (onSuccess.data.Status) {
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        setIsEnableFetching(true)
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        toast.success(onSuccess.data.Message || t('Deleted successfully'))
      } else {
        toast.error(onSuccess.data.Message || t('Failed to delete'))
      }
    },
    onError => {
      console.error('Delete error:', onError)
      toast.error(t('Failed to delete. Please try again.'))
    }
  )

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    const userData = getUserData()
    try {
      await deleteDocument({
        LEAVE_REGULARITY_ID: deleteTarget.LEAVE_REGULARITY_ID || 0,
        UPDATE_BY: `${userData?.EMPLOYEE_CODE}` || ''
      })
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (error: any) {
      console.error('Delete error:', error)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedData(null)
  }

  // --- Columns Definition ---
  const columns = useMemo<MRT_ColumnDef<any>[]>(
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
        },
        size: 140,
        muiTableBodyCellProps: {
          align: 'center'
        }
      },
      {
        accessorKey: 'LEAVE_REGULARITY_NAME',
        enableSorting: false,
        header: t('Document Name'),
        size: 200
      },
      {
        accessorKey: 'LEAVE_REGULARITY_FILE_NAME',
        enableSorting: false,

        header: t('Document File Name')
      },
      {
        accessorKey: 'DESCRIPTION',
        enableSorting: false,

        header: t('Description')
      },
      {
        accessorKey: 'MODIFIED',
        header: t('Modified'),
        size: 200,
        Cell: ({ row }) => dayjs(row.original.MODIFIED).format('DD MMM YYYY HH:mm')
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Modified By'),
        size: 200
      }
    ],
    [t]
  )

  // Data for table
  const tableData = data?.data?.ResultOnDb || []
  const totalCount = data?.data?.TotalCountOnDb || 0

  return (
    <>
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={t('Search result')}
          action={
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{ color: 'white', bgcolor: 'primary.main' }}
            >
              {t('Add new')}
            </Button>
          }
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            enableRowActions={true}
            renderRowActions={({ row }) => <ActionsMenu row={row} onDelete={handleDeleteClick} />}
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
            // Handler functions
            onColumnFiltersChange={setColumnFilters}
            onColumnFilterFnsChange={setColumnFilterFns}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onColumnVisibilityChange={setColumnVisibility}
            onDensityChange={setDensity}
            onColumnPinningChange={setColumnPinning}
            onColumnOrderChange={setColumnOrder}
            // State Management
            state={{
              columnFilters,
              isLoading: isPending,
              pagination,
              showAlertBanner: isError,
              showProgressBars: isFetching,
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

      {/* Add Modal */}
      <AddDocumentModal open={modalOpen} onClose={handleCloseModal} onSubmitSuccess={handleCloseModal} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={false}
      />
    </>
  )
}

export default DocumentSearchResult
