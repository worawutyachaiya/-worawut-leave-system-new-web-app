// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// MUI Imports
import { Box, Button, Card, CardHeader, Chip } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

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

// Third-party Imports
import { useUpdateEffect } from 'react-use'

// _template Imports
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useDxContext } from '@/_template/DxContextProvider'

// Local Imports
import type { FormDataPage } from './validationSchema'

// Hook & Type Imports
import { useSearchEmployeeProbation } from '@/_workspace/react-query/hooks/useHrSearchProbation'
import type { UserProbationInterface } from '@/_workspace/types/hr-user-probation/HrUserProbation'

// Modal Imports
import EditPassProModal from './modal/EditPassProModal'
import { useSettings } from '@/@core/hooks/useSettings'
import { useTranslation } from '@/contexts/TranslationContext'

// Static objects moved outside component for performance //dont delete comment
const TABLE_PROPS = { sx: { tableLayout: 'auto' } }

const UserProbationSearchResult = () => {
  const { settings } = useSettings()
  const { t } = useTranslation()

  const { control, getValues, setValue } = useFormContext<FormDataPage>()

  // Context
  const { isEnableFetching, setIsEnableFetching } = useDxContext()

  // Watch submitted filters
  const submittedFilters = useWatch({ control, name: 'submittedFilters' })

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

  // Build search params using getValues
  const paramForSearch = {
    EMPLOYEE_CODE: getValues('searchFilters.employeeCode')?.EMPLOYEE_CODE || '',
    EMPLOYEE_NAME: getValues('searchFilters.employeeName') || '',
    EMPLOYEE_DEPT: getValues('searchFilters.section')?.SECTION || '',
    IS_PASS_PRO:
      getValues('searchFilters.status')?.value !== undefined ? String(getValues('searchFilters.status')?.value) : '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  // Fetch Data Hook
  const {
    data: probationData,
    isPending,
    isError,
    isRefetching,
    isFetching,
    refetch
  } = useSearchEmployeeProbation(
    paramForSearch,
    false // Disabled by default, will be triggered by refetch()
  )

  // Extract Data
  const getTableData = (): UserProbationInterface[] => {
    const resultData = probationData?.data?.ResultOnDb || []

    // Check if ResultOnDb is a two-dimensional array (multi-statement SQL)
    if (Array.isArray(resultData) && resultData.length > 1 && Array.isArray(resultData[1])) {
      return resultData[1] as UserProbationInterface[]
    }

    // Check if ResultOnDb is a simple array of objects (single-statement SQL)
    if (Array.isArray(resultData) && resultData.length > 0 && typeof resultData[0] === 'object') {
      return resultData as UserProbationInterface[]
    }

    return []
  }

  const getTotalCount = (): number => {
    const resultData = probationData?.data?.ResultOnDb || []

    // Check for multi-statement format: [[{TOTAL_COUNT}], [data...]]
    if (
      Array.isArray(resultData) &&
      resultData.length > 0 &&
      Array.isArray(resultData[0]) &&
      resultData[0].length > 0
    ) {
      return Number(resultData[0][0].TOTAL_COUNT || 0)
    }

    // For single-statement format, return the array length
    if (Array.isArray(resultData)) {
      return resultData.length
    }

    return 0
  }

  const data = useMemo(() => getTableData(), [probationData])
  const totalCount = useMemo(() => getTotalCount(), [probationData])

  // Sync isEnableFetching
  useEffect(() => {
    if (isFetching === false) {
      setIsEnableFetching(false)
    }
  }, [isFetching, setIsEnableFetching])

  // Trigger search when table state changes
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [JSON.stringify([pagination, sorting])]) // Currently sorting is manual but not passed to API yet, but pagination is.

  // Trigger refetch when isEnableFetching is true
  useEffect(() => {
    if (isEnableFetching) {
      refetch()
    }
  }, [isEnableFetching, refetch])

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<UserProbationInterface | null>(null)

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

  // Handler for pass probation date button
  const handleEnterPassProbationDate = (row: UserProbationInterface) => {
    setSelectedEmployee(row)
    setEditModalOpen(true)
  }

  // Handler for save pass pro date
  const handleSavePassPro = (data: any) => {
    // TODO: Call API to update pass pro date
    // After successful update, refetch data or update UI
  }

  // --- Columns Definition ---
  const columns = useMemo<MRT_ColumnDef<UserProbationInterface>[]>(
    () => [
      {
        accessorKey: 'IS_PASS_PRO',
        header: t('Status'),
        enableSorting: false,
        Cell: ({ row }) => {
          const passpro = row.original.IS_PASS_PRO
          return (
            <Chip
              variant={settings.mode === 'dark' ? 'tonal' : 'filled'}
              size='small'
              label={passpro === 1 ? t('Passed') : t('No')}
              color={passpro === 1 ? 'success' : 'error'}
            />
          )
        }
      },
      {
        accessorKey: 'EMPLOYEE_START_WORK',
        header: 'START WORK'
      },
      {
        accessorKey: 'PASS_PRD_DATE',
        header: 'PASS PRD DATE',
        Cell: ({ row }) => {
          const date = row.original?.PASS_PRD_DATE
          return date ? (
            <Box sx={{ textAlign: 'center' }}>{date}</Box>
          ) : (
            <Button
              variant='contained'
              color='primary'
              size='medium'
              onClick={() => handleEnterPassProbationDate(row.original)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Enter Pass Probation Date
            </Button>
          )
        }
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: 'EMPLOYEE CODE'
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: 'FIRST NAME'
      },
      {
        accessorKey: 'EMPLOYEE_SURNAME',
        header: 'SURNAME'
      },
      {
        accessorKey: 'EMPLOYEE_DEPT',
        header: 'DEPARTMENT'
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: 'SECTION'
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
          enableRowActions={false}
          data={data}
          isError={isError}
          rowCount={totalCount}
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
            isLoading: isPending,
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

      {/* Edit Pass Pro Modal */}
      <EditPassProModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        selectedEmployee={selectedEmployee}
        onSave={handleSavePassPro}
      />
    </Card>
  )
}

export default UserProbationSearchResult
