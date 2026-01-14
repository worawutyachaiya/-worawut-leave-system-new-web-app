import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Card, Stack, Typography, useTheme, Button, CardHeader, Divider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import BorderColorIcon from '@mui/icons-material/BorderColor'
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
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { DxMRTTable } from '@/_template/DxMRTTable'
import {
  useRemainLeaveSearch,
  useUpdateRemainLeave,
  PREFIX_QUERY_KEY_REMAIN_LEAVE
} from '@/_workspace/react-query/hooks/useSearchRemainLeave'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
import { RemainLeaveInterface } from '@/_workspace/types/remain-leave/RemainLeaveInterface'
import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import RemainLeaveEditModal from './modal/RemainLeaveEditModal'

const RemainLeaveSearchResult = () => {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { settings } = useSettings()
  const checkPermission = useCheckPermission()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<RemainLeaveInterface | null>(null)

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
  const searchFilters = getValues('searchFilters')

  const paramForSearch = {
    EMPLOYEE_CODE: searchFilters?.employeeCode || '',
    EMPLOYEE_NAME: searchFilters?.employeeName || '',
    EMPLOYEE_SECTION: searchFilters?.section?.SECTION || '',
    EMPLOYEE_ID_REQUEST: getUserData().EMPLOYEE_CODE || '',
    START_DATE: searchFilters?.startDate ? dayjs(searchFilters.startDate).format('YYYY-MM-DD') : '',
    Start: String(pagination.pageIndex * pagination.pageSize),
    Limit: String(pagination.pageSize),
    Order: []
  }

  const { data, isLoading, isError, isFetching, isRefetching } = useRemainLeaveSearch(paramForSearch, true)

  const updateMutation = useUpdateRemainLeave(
    response => {
      if (response?.data?.Status) {
        toast.success('Update Remain Leave Success')
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_REMAIN_LEAVE] })
        setEditModalOpen(false)
        setSelectedData(null)
      } else {
        toast.error(response?.data?.Message || 'Update failed')
      }
    },
    error => {
      toast.error(error?.message || 'Update failed')
    }
  )

  const tableData = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    if (Array.isArray(rawResult) && Array.isArray(rawResult[1])) {
      return rawResult[1]
    }
    if (
      Array.isArray(rawResult) &&
      rawResult.length > 0 &&
      typeof rawResult[0] === 'object' &&
      !Array.isArray(rawResult[0])
    ) {
      return rawResult
    }
    return []
  }, [data])

  const totalRecords = useMemo(() => {
    const rawResult = data?.data?.ResultOnDb as any
    if (Array.isArray(rawResult) && Array.isArray(rawResult[0]) && rawResult[0][0]?.TOTAL_COUNT) {
      return rawResult[0][0].TOTAL_COUNT
    }
    return data?.data?.TotalCountOnDb || 0
  }, [data])

  const handleOpenEditModal = (rowData: RemainLeaveInterface) => {
    setSelectedData(rowData)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedData(null)
  }

  const handleSaveRemainLeave = (payload: any) => {
    updateMutation.mutate(payload)
  }

  const columns = useMemo<MRT_ColumnDef<RemainLeaveInterface>[]>(
    () => [
      {
        id: 'detail',
        header: 'ACTIONS',
        Cell: ({ row }) => (
          <Button size='small' onClick={() => handleOpenEditModal(row.original)}>
            <BorderColorIcon fontSize='small' />
          </Button>
        ),
        enableColumnActions: false,
        enableSorting: false
      },
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: 'EMPLOYEE ID'
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: 'EMPLOYEE NAME',
        accessorFn: row => `${row.EMPLOYEE_NAME || ''}${row.EMPLOYEE_SURNAME ? ' ' + row.EMPLOYEE_SURNAME : ''}`
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: 'SECTION'
      },
      {
        accessorKey: 'EMPLOYEE_START_WORK',
        header: 'START WORK',
        Cell: ({ cell }) => {
          const dateValue = cell.getValue() as string
          return dateValue ? dayjs(dateValue).format('DD-MMM-YYYY') : '-'
        }
      },
      {
        accessorKey: 'LEAVE_TYPE_CODE',
        header: 'LEAVE TYPE'
      },
      {
        accessorKey: 'LEAVE_REMAIN_DAY',
        header: 'LEAVE REMAINING'
      }
    ],
    []
  )

  const renderEmptyRowsFallback = () => {
    return (
      <Stack
        justifyContent='center'
        alignItems='center'
        spacing={2}
        sx={{ py: 10, width: '100%', backgroundColor: theme.palette.background.paper }}
      >
        <i className='tabler-file-off' style={{ fontSize: '64px', color: '#E0E0E0' }} />
        <Box textAlign='center'>
          <Typography variant='h6' color='text.secondary'>
            No results found
          </Typography>
          <Typography variant='body2' color='text.disabled'>
            Please adjust your filters or Try again.
          </Typography>
        </Box>
      </Stack>
    )
  }

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
          title='Search result'
          action={
            <Stack direction='row' spacing={2} alignItems='center'>
              <Button variant='tonal' color='primary'>
                Export Remain Leave
              </Button>
              <Divider orientation='vertical' flexItem />
              <Button variant='tonal' color='success'>
                Export AL Exceed
              </Button>
            </Stack>
          }
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            columns={columns}
            rowCount={totalRecords}
            data={tableData}
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
            enableRowSelection={false}
            enableRowActions={false}
            manualPagination
            manualSorting
            renderEmptyRowsFallback={renderEmptyRowsFallback}
            enableColumnActions={false}
            enableColumnFilters={false}
            enableDensityToggle={true}
            enableFullScreenToggle={true}
            enableHiding={true}
            initialState={{
              pagination: { pageSize: 10, pageIndex: 0 },
              density: 'comfortable'
            }}
          />
        </LocalizationProvider>
      </Card>

      <RemainLeaveEditModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        selectedData={selectedData}
        onSave={handleSaveRemainLeave}
        isLoading={updateMutation.isPending}
      />
    </>
  )
}

export default RemainLeaveSearchResult
