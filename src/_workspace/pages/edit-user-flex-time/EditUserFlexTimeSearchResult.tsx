import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Card, CardHeader, Chip } from '@mui/material'
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
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  useSearchUserFlexTime,
  useDeleteUserFlexTime,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useFlexTime'
import { useSettings } from '@/@core/hooks/useSettings'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { FormDataPage } from './validationSchema'
import type { UserFlexTimeData } from '@/_workspace/types/flex-time/FlexTimeInterface'

// Components
import ActionsMenu from './components/ActionsMenu'
import UserFlexTimeEditModal from './modal/UserFlexTimeEditModal'
import DeleteConfirmDialog from './modal/DeleteConfirmDialog'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

function EditUserFlexTimeSearchResult() {
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const { settings } = useSettings()
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()
  const queryClient = useQueryClient()
  useWatch({ control, name: 'searchFilters' })

  // Modal States
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<UserFlexTimeData | null>(null)

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

  // Delete Mutation
  const { mutateAsync: deleteUserFlexTime, isPending: isDeleting } = useDeleteUserFlexTime(
    response => {
      if (response.data.Status) {
        queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_USER`] })
        setIsEnableFetching(true)
        toast.success(response.data.Message || t('Deleted successfully'))
        setDeleteDialogOpen(false)
        setSelectedRow(null)
      } else {
        toast.error(response.data.Message || t('Failed to delete'))
      }
    },
    error => {
      console.error('Delete error:', error)
      toast.error(t('Failed to delete. Please try again.'))
    }
  )

  // Handler functions
  const handleEdit = (row: UserFlexTimeData) => {
    setSelectedRow(row)
    setEditModalOpen(true)
  }

  const handleDelete = (row: UserFlexTimeData) => {
    setSelectedRow(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedRow) {
      const userData = getUserData()
      await deleteUserFlexTime({
        FLEX_TIME_REQUEST_ID: selectedRow.FLEX_TIME_REQUEST_ID,
        EMPLOYEE_CODE: userData?.EMPLOYEE_CODE || ''
      })
    }
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedRow(null)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedRow(null)
  }

  // Search params ตาม format ของ API
  const searchFilters = getValues('searchFilters')
  const paramForSearch = {
    EMPLOYEE_CODE: searchFilters?.employeeCode || '',
    EMPLOYEE_NAME: searchFilters?.employeeName || '',
    EMPLOYEE_DEPT: searchFilters?.section?.SECTION || '',
    INUSE: '',
    Start: pagination.pageIndex.toString(),
    Limit: pagination.pageSize.toString(),
    Order: sorting
  }

  const { data, isLoading, isFetching, isRefetching, isError } = useSearchUserFlexTime(paramForSearch, isEnableFetching)

  // Process table data
  const tableData = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    let result: UserFlexTimeData[] = []

    if (Array.isArray(rawResult)) {
      if (Array.isArray(rawResult[1])) {
        result = rawResult[1]
      } else {
        result = rawResult
      }
    }

    // Transform data ให้ตรงกับ columns
    return result.map(item => ({
      ...item,
      EMPLOYEE_ID: item.FLEX_TIME_REQUEST_EMPLOYEE_CODE,
      EMPLOYEE_FULL_NAME:
        item.EMPLOYEE_FULL_NAME || `${item.EMPLOYEE_NAME || ''} ${item.EMPLOYEE_SURNAME || ''}`.trim(),
      LEAVE_DATE_RANGE:
        item.LEAVE_DATE_RANGE ||
        `${dayjs(item.FLEX_TIME_REQUEST_START_DATE).format('DD-MMM-YYYY')} ถึง ${dayjs(item.FLEX_TIME_REQUEST_END_DATE).format('DD-MMM-YYYY')}`
    }))
  }, [data])

  // Total count
  const totalRecords = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    if (Array.isArray(rawResult) && Array.isArray(rawResult[0]) && rawResult[0][0]?.TOTAL_COUNT) {
      return rawResult[0][0].TOTAL_COUNT
    }
    return data?.data?.TotalCountOnDb || tableData.length || 0
  }, [data, tableData])

  useEffect(() => {
    if (!isFetching) setIsEnableFetching(false)
  }, [isFetching, setIsEnableFetching])

  // Sync table settings to form context for DxWatchSearchFilters auto-save
  useUpdateEffect(() => {
    setValue('searchResults.columnFilters', columnFilters)
  }, [columnFilters])

  useUpdateEffect(() => {
    setValue('searchResults.sorting', sorting)
  }, [sorting])

  useUpdateEffect(() => {
    setValue('searchResults.pageSize', pagination.pageSize)
  }, [pagination.pageSize])

  useUpdateEffect(() => {
    setValue('searchResults.density', density)
  }, [density])

  useUpdateEffect(() => {
    setValue('searchResults.columnVisibility', columnVisibility)
  }, [columnVisibility])

  useUpdateEffect(() => {
    setValue('searchResults.columnPinning', columnPinning)
  }, [columnPinning])

  useUpdateEffect(() => {
    setValue('searchResults.columnOrder', columnOrder)
  }, [columnOrder])

  useUpdateEffect(() => {
    setValue('searchResults.columnFilterFns', columnFilterFns)
  }, [columnFilterFns])

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])

  // Columns ตาม old system
  const columns = useMemo<MRT_ColumnDef<UserFlexTimeData>[]>(
    () => [
      {
        accessorKey: 'INUSE',
        header: t('Status'),
        size: 100,
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
        accessorKey: 'CREATE_DATE',
        header: t('Request Flex Time Date'),
        Cell: ({ row }) => dayjs(row.original.CREATE_DATE).format('DD-MMM-YYYY') || '-',
        size: 250
      },
      {
        accessorKey: 'FLEX_TIME_REQUEST_EMPLOYEE_CODE',
        header: t('Employee Code'),
        enableSorting: false,
        size: 200
      },
      {
        accessorKey: 'EMPLOYEE_FULL_NAME',
        header: t('Employee Name'),
        Cell: ({ row }) => `${row.original.EMPLOYEE_NAME || ''} ${row.original.EMPLOYEE_SURNAME || ''}`.trim(),
        enableSorting: false
      },
      {
        header: t('Section'),
        enableSorting: false,
        size: 150
      },
      {
        accessorKey: 'LEAVE_DATE_RANGE',
        header: t('Leave Date'),
        enableSorting: false,
        Cell: ({ row }) =>
          `${dayjs(row.original.FLEX_TIME_REQUEST_START_DATE).format('DD-MMM-YYYY')} ${t('to')} ${dayjs(row.original.FLEX_TIME_REQUEST_END_DATE).format('DD-MMM-YYYY')}` ||
          '-'
      },
      {
        accessorKey: 'FLEX_TIME_DESCRIPTION',
        header: t('Time'),
        enableSorting: false,
        size: 140
      },
      {
        accessorKey: 'FLEX_TIME_REQUEST_TOTAL_DAY',
        header: t('Total Day Leave'),
        enableSorting: false,
        Cell: ({ row }) => row.original.FLEX_TIME_REQUEST_TOTAL_DAY,
        size: 140
      },
      {
        accessorKey: 'UPDATE_DATE',
        header: t('Modified'),
        Cell: ({ row }) => dayjs(row.original.UPDATE_DATE).format('DD-MMM-YYYY') || '-',
        enableSorting: true,
        size: 180
      },
      {
        accessorKey: 'UPDATE_BY',
        header: t('Modified By'),
        enableSorting: true,
        size: 180
      }
    ],
    [t, settings.mode]
  )

  const isFirstRender = useRef(true)
  useEffect(() => {
    isFirstRender.current = false
  }, [])

  return (
    <>
      <Card>
        <CardHeader title={t('Search result')} titleTypographyProps={{ variant: 'h5' }} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            data={tableData}
            rowCount={totalRecords}
            isError={isError}
            onColumnFiltersChange={setColumnFilters}
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
            manualPagination
            displayColumnDefOptions={{
              'mrt-row-actions': {
                header: t('ACTIONS'),
                size: 100,
                muiTableBodyCellProps: {
                  align: 'center'
                }
              }
            }}
            manualSorting
            enableColumnOrdering
            enableColumnActions={false}
            enableColumnFilters={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableRowActions
            renderRowActions={({ row }) => <ActionsMenu row={row} onEdit={handleEdit} onDelete={handleDelete} />}
          />
        </LocalizationProvider>
      </Card>

      {/* Edit Modal */}
      <UserFlexTimeEditModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        data={selectedRow}
        onSubmitSuccess={() => {
          setIsEnableFetching(true)
        }}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  )
}

export default EditUserFlexTimeSearchResult
