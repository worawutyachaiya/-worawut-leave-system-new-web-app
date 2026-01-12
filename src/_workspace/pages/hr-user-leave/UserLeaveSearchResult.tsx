// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// MUI Imports
import { Box, Card, CardHeader, Chip, Button } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

// Third-party Imports
import { useUpdateEffect } from 'react-use'

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
import { useFormContext, useWatch } from 'react-hook-form'

// React Query
import {
  useSearchUserLeave,
  useUpdateUserLeave,
  useDeleteUserLeave
} from '@/_workspace/react-query/hooks/useHrUserLeave'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrUserLeave'
import { toast } from 'react-toastify'

// _template Imports
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'

// Local Imports
import type { FormDataPage } from './validationSchema'
import { UserLeaveInterface } from '@/_workspace/types/hr-user-leave/HrUserLeave'
import UserLeaveEditModal from './modal/UserLeaveEditModal'
import UserLeaveDeleteModal from './modal/UserLeaveDeleteModal'
import ActionsMenu from './components/ActionsMenu'
import LeaveFileColumn from './components/LeaveFileColumn'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useTranslation } from '@/contexts/TranslationContext'
import { useSettings } from '@/@core/hooks/useSettings'

// Static objects moved outside component for performance //dont delete comment
const TABLE_PROPS = { sx: { tableLayout: 'auto' } }

const UserLeaveSearchResult = () => {
  const { settings } = useSettings()

  const { t } = useTranslation()
  const { control, getValues, setValue } = useFormContext<FormDataPage>()

  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  // Watch submitted filters
  // const submittedFilters = useWatch({ control, name: 'submittedFilters' })

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

  // Track first render
  const isFirstRender = useRef(true)
  useEffect(() => {
    isFirstRender.current = false
  }, [])

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<UserLeaveInterface | null>(null)

  const queryClient = useQueryClient()

  // Build search params using getValues
  const paramForSearch = {
    EMPLOYEE_CODE: getValues('searchFilters.employeeCode')?.EMPLOYEE_CODE || '',
    EMPLOYEE_NAME: getValues('searchFilters.employeeName') || '',
    EMPLOYEE_SECTION: getValues('searchFilters.section')?.SECTION || '',
    Start: String(pagination.pageIndex * pagination.pageSize),
    Limit: String(pagination.pageSize),
    Order: sorting.length > 0 ? sorting : undefined
  }

  const { data, error, isPending, isFetching, isRefetching, refetch } = useSearchUserLeave(
    paramForSearch,
    isEnableFetching
  )

  // Helper: Get table data from API response
  // Helper: Get table data from API response
  const getTableData = (): UserLeaveInterface[] => {
    const resultData = data?.data?.ResultOnDb

    // Check for multi-statement response: [ [ {TOTAL_COUNT: n} ], [ data... ] ]
    if (Array.isArray(resultData) && resultData.length > 1 && Array.isArray(resultData[1])) {
      return resultData[1] as UserLeaveInterface[]
    }

    // Fallback or if structure matches simple array
    if (Array.isArray(resultData) && resultData.length > 0 && !Array.isArray(resultData[0])) {
      return resultData as unknown as UserLeaveInterface[]
    }

    return []
  }

  // Helper: Get total count
  const getTotalCount = (): number => {
    const resultData = data?.data?.ResultOnDb || []

    if (Array.isArray(resultData) && resultData.length > 0 && Array.isArray(resultData[0])) {
      const countResult = resultData[0] as any[]
      if (countResult.length > 0 && typeof countResult[0].TOTAL_COUNT !== 'undefined') {
        return Number(countResult[0].TOTAL_COUNT)
      }
    }

    return 0
  }

  // Reset isEnableFetching after fetch completes
  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching, setIsEnableFetching])

  // Trigger search when table state changes
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([columnFilters, sorting, pagination])])

  // Note: Removed manual refetch useEffect - now using enabled option in useQuery
  // When isEnableFetching is true and params change, the query will automatically re-fetch

  // Mutations
  const updateMutation = useUpdateUserLeave(
    data => {
      // Success
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      setEditModalOpen(false)
      setSelectedLeave(null)
      refetch()
      toast.success('Update leave successfully')
    },
    error => {
      // Error
      console.error('Update failed:', error)
      toast.error('Failed to update leave. Please try again.')
    }
  )

  const deleteMutation = useDeleteUserLeave(
    data => {
      // Success
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      setDeleteModalOpen(false)
      setSelectedLeave(null)
      refetch()
      toast.success('Delete leave successfully')
    },
    error => {
      // Error
      console.error('Delete failed:', error)
      toast.error('Failed to delete leave. Please try again.')
    }
  )

  // Handlers
  const handleEdit = (leave: UserLeaveInterface) => {
    // ตรวจสอบว่ารายการเป็น Cancel อยู่แล้วหรือไม่
    if (Number(leave.INUSE) === 0) {
      toast.error('Cannot Edit: This leave is already cancelled. ไม่สามารถแก้ไขรายการที่ถูกยกเลิกได้')
      return
    }
    setEditModalOpen(true)
    setSelectedLeave(leave)
  }

  const handleDelete = (leave: UserLeaveInterface) => {
    // ตรวจสอบว่ารายการเป็น Cancel อยู่แล้วหรือไม่
    if (Number(leave.INUSE) === 0) {
      toast.error('Cannot delete: This leave is already cancelled. ไม่สามารถลบรายการที่ถูกยกเลิกได้')
      return
    }
    setDeleteModalOpen(true)
    setSelectedLeave(leave)
  }

  const handleSaveEdit = (data: any) => {
    console.log('handleSaveEdit called with data:', data)
    updateMutation.mutate(data)
  }

  const handleConfirmDelete = () => {
    if (selectedLeave) {
      deleteMutation.mutate({
        LEAVE_REQUEST_ID: selectedLeave.LEAVE_REQUEST_ID,
        LEAVE_TYPE_ID: selectedLeave.LEAVE_TYPE_ID,
        LEAVE_REQUEST_TOTAL_DAY: selectedLeave.LEAVE_REQUEST_TOTAL_DAY || selectedLeave.TOTAL_DAY_LEAVE,
        EMPLOYEE_CODE: selectedLeave.EMPLOYEE_CODE || selectedLeave.EMPLOYEE_ID,
        // EMPLOYEE_ID: selectedLeave.EMPLOYEE_ID || selectedLeave.EMPLOYEE_CODE,
        UPDATE_BY: getUserData()?.EMPLOYEE_CODE || 'ถ้าคุณเห็นข้อความนี้แสดงว่าไม่ปกติแล้ว'
      })
    }
  }

  const mappedData: UserLeaveInterface[] = useMemo(() => {
    return getTableData().map((item: any) => ({
      ...item,
      STATUS: Number(item.INUSE) === 1 ? 'Use' : 'Cancel'
    }))
  }, [data])

  const isError = !!error

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

  // ------ Columns ------
  const columns = useMemo<MRT_ColumnDef<UserLeaveInterface>[]>(
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
        header: 'REQUEST DATE'
      },
      {
        accessorKey: 'LEAVE_ATTACHMENT',
        header: 'LEAVE ATTACHMENT',
        enableSorting: false,
        Cell: ({ row }) => {
          return (
            <LeaveFileColumn
              fileName={row.original.LEAVE_REQUEST_FILE_UPLOAD_NAME}
              filePath={row.original.LEAVE_REQUEST_FILE_UPLOAD_PATH}
            />
          )
        }
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: 'EMPLOYEE CODE'
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: 'EMPLOYEE NAME',
        Cell: ({ row }) => `${row.original.EMPLOYEE_NAME || ''} ${row.original.EMPLOYEE_SURNAME || ''}`
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: 'SECTION'
      },
      {
        accessorKey: 'LEAVE_TYPE_DESCRIPTION_TH',
        header: 'LEAVE TYPE'
      },
      {
        accessorKey: 'LEAVE_REQUEST_START_DATE',
        header: 'LEAVE DATE',
        Cell: ({ cell }) => {
          const date = cell.getValue<string>()
          if (!date) return '-'
          try {
            return new Date(date).toLocaleDateString('th-TH')
          } catch {
            return date
          }
        }
      },
      {
        accessorKey: 'LEAVE_REQUEST_TIME',
        header: 'TIME'
      },
      {
        accessorKey: 'LEAVE_REQUEST_TOTAL_DAY',
        header: 'TOTAL DAY LEAVE'
      },
      {
        accessorKey: 'LEAVE_REQUEST_REASON',
        header: 'REASON'
      },
      {
        accessorKey: 'MODIFIED_DATE',
        header: 'MODIFIED'
      },
      {
        accessorKey: 'UPDATE_BY',
        header: 'MODIFIED BY'
      }
    ],
    []
  )

  return (
    <Card sx={{ mt: 4 }}>
      <CardHeader title='Search result' />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DxMRTTable
          columns={columns}
          enableRowActions={true}
          positionActionsColumn='first'
          renderRowActions={({ row }) => <ActionsMenu row={row} onEdit={handleEdit} onDelete={handleDelete} />}
          displayColumnDefOptions={{
            'mrt-row-actions': {
              muiTableHeadCellProps: { align: 'center' },
              muiTableBodyCellProps: { align: 'center' }
            }
          }}
          data={mappedData}
          isError={isError}
          rowCount={getTotalCount()}
          manualPagination
          manualSorting
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
          muiTableProps={TABLE_PROPS}
        />
      </LocalizationProvider>

      {/*-------- Edit Modal --------*/}
      <UserLeaveEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedLeave(null)
        }}
        selectedLeave={selectedLeave}
        onSave={handleSaveEdit}
      />

      {/*-------- Delete Modal --------*/}
      <UserLeaveDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedLeave(null)
        }}
        selectedLeave={selectedLeave}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}

export default UserLeaveSearchResult
