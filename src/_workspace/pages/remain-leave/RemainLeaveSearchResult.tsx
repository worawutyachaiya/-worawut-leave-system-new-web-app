import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Card, Stack, Typography, useTheme, Button, CardHeader, Divider, CircularProgress } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
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
import { utils, writeFile } from 'xlsx'
import { DxMRTTable } from '@/_template/DxMRTTable'
import {
  useRemainLeaveSearch,
  useRemainLeaveSearchForExport,
  useUpdateRemainLeave,
  PREFIX_QUERY_KEY_REMAIN_LEAVE
} from '@/_workspace/react-query/hooks/useSearchRemainLeave'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
import { RemainLeaveInterface } from '@/_workspace/types/remain-leave/RemainLeaveInterface'
import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import RemainLeaveEditModal from './modal/RemainLeaveEditModal'
import { useTranslation } from '@/contexts/TranslationContext'

const RemainLeaveSearchResult = () => {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { settings } = useSettings()
  const checkPermission = useCheckPermission()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<RemainLeaveInterface | null>(null)
  const [isExportingRemainLeave, setIsExportingRemainLeave] = useState(false)
  const [isExportingALExceed, setIsExportingALExceed] = useState(false)

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
    EMPLOYEE_CODE: searchFilters?.employeeCode?.EMPLOYEE_CODE || '',
    EMPLOYEE_NAME: searchFilters?.employeeName || '',
    EMPLOYEE_SECTION: searchFilters?.section?.SECTION || '',
    EMPLOYEE_ID_REQUEST: getUserData().EMPLOYEE_CODE || '',
    START_DATE: searchFilters?.startDate ? dayjs(searchFilters.startDate).format('YYYY-MM-DD') : '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }

  const { data, isLoading, isError, isFetching, isRefetching } = useRemainLeaveSearch(paramForSearch, true)

  const exportParamsRemainLeave = {
    EMPLOYEE_CODE: searchFilters?.employeeCode?.EMPLOYEE_CODE || '',
    EMPLOYEE_NAME: searchFilters?.employeeName || '',
    EMPLOYEE_SECTION: searchFilters?.section?.SECTION || '',
    EMPLOYEE_ID_REQUEST: getUserData().EMPLOYEE_CODE || '',
    Start: '0',
    Limit: '999999',
    Order: []
  }

  const exportParamsALExceed = {
    ...exportParamsRemainLeave,
    LEAVE_TYPE_ID: 1
  }

  const { data: exportRemainLeaveData, isFetching: isFetchingRemainLeaveExport } = useRemainLeaveSearchForExport(
    exportParamsRemainLeave,
    isExportingRemainLeave
  )

  const { data: exportALExceedData, isFetching: isFetchingALExceedExport } = useRemainLeaveSearchForExport(
    exportParamsALExceed,
    isExportingALExceed
  )

  const getExportData = (rawData: any): RemainLeaveInterface[] => {
    if (Array.isArray(rawData) && Array.isArray(rawData[1])) {
      return rawData[1]
    }
    if (Array.isArray(rawData) && rawData.length > 0 && typeof rawData[0] === 'object' && !Array.isArray(rawData[0])) {
      return rawData
    }
    return []
  }

  const leaveTypeToColumn: Record<number, string> = {
    1: 'A/L',
    2: 'BD/L',
    3: 'B/L',
    4: 'F/L',
    5: 'MR/L',
    6: 'ML/L',
    7: 'MT/L',
    8: 'P/L',
    9: 'S/L',
    10: 'SP/L',
    12: 'AE/L',
    13: 'O/L',
    21: 'AL_ACCUMULATE',
    22: 'AL_EXCEED'
  }
  const { t } = useTranslation()

  const transformDataForExport = (dataList: RemainLeaveInterface[]) => {
    // Group by employee
    const employeeMap = new Map<string, any>()

    dataList.forEach(item => {
      const empCode = item.EMPLOYEE_CODE
      if (!employeeMap.has(empCode)) {
        employeeMap.set(empCode, {
          EMPLOYEE_CODE: empCode,
          EMPLOYEE_NAME: `${item.EMPLOYEE_NAME || ''} ${item.EMPLOYEE_SURNAME || ''}`.trim(),
          SECTION: item.EMPLOYEE_SECTION,
          'A/L': 0,
          'BD/L': 0,
          'B/L': 0,
          'F/L': 0,
          'MR/L': 0,
          'ML/L': 0,
          'MT/L': 0,
          'P/L': 0,
          'S/L': 0,
          'SP/L': 0,
          'AE/L': 0,
          'O/L': 0,
          AL_ACCUMULATE: 0,
          AL_EXCEED: 0
        })
      }
      const columnName = leaveTypeToColumn[item.LEAVE_TYPE_ID]
      if (columnName) {
        employeeMap.get(empCode)![columnName] = item.LEAVE_REMAIN_DAY || 0
      }
    })

    return Array.from(employeeMap.values())
  }

  const transformDataForALExceedExport = (dataList: RemainLeaveInterface[]) => {
    const currentYear = dayjs().year()
    return dataList
      .filter(item => item.LEAVE_TYPE_ID === 1 && (item.LEAVE_REMAIN_DAY || 0) < 0)
      .map(item => ({
        YEAR: currentYear,
        EMPLOYEE_CODE: item.EMPLOYEE_CODE,
        DAY: Math.abs(item.LEAVE_REMAIN_DAY || 0)
      }))
  }

  const handleExportRemainLeave = () => {
    const fileName = `RemainLeave_${dayjs().format('YYYYMMDDHHmmss')}`
    toast.loading(`${fileName} - Initializing...`, { toastId: 'export-remain-leave' })
    setIsExportingRemainLeave(true)
  }

  const handleExportALExceed = () => {
    const fileName = `ALExceed_${dayjs().format('YYYYMMDDHHmmss')}`
    toast.loading(`${fileName} - Initializing...`, { toastId: 'export-al-exceed' })
    setIsExportingALExceed(true)
  }

  useEffect(() => {
    if (isExportingRemainLeave && !isFetchingRemainLeaveExport && exportRemainLeaveData?.data?.ResultOnDb) {
      try {
        const rawData = getExportData(exportRemainLeaveData.data.ResultOnDb)
        if (rawData.length === 0) {
          toast.update('export-remain-leave', {
            render: 'No data to export',
            type: 'error',
            isLoading: false,
            autoClose: 3000
          })
        } else {
          const exportData = transformDataForExport(rawData)
          const workbook = utils.book_new()
          const worksheet = utils.json_to_sheet(exportData)
          utils.book_append_sheet(workbook, worksheet, 'Remain Leave')
          const fileName = `RemainLeave_${dayjs().format('YYYY-MM-DD_HHmmss')}.xlsx`
          writeFile(workbook, fileName)
          toast.update('export-remain-leave', {
            render: 'Export successfully',
            type: 'success',
            isLoading: false,
            autoClose: 3000
          })
        }
      } catch (error) {
        console.error('Export error:', error)
        toast.update('export-remain-leave', {
          render: 'Export failed',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      }
      setIsExportingRemainLeave(false)
    }
  }, [isExportingRemainLeave, isFetchingRemainLeaveExport, exportRemainLeaveData])

  useEffect(() => {
    if (isExportingALExceed && !isFetchingALExceedExport && exportALExceedData?.data?.ResultOnDb) {
      try {
        const rawData = getExportData(exportALExceedData.data.ResultOnDb)
        const exportData = transformDataForALExceedExport(rawData)
        const workbook = utils.book_new()
        const worksheetData = exportData.length > 0 ? exportData : [{ YEAR: '', EMPLOYEE_CODE: '', DAY: '' }]
        const worksheet = utils.json_to_sheet(worksheetData, { skipHeader: false })
        if (exportData.length === 0) {
          utils.sheet_add_json(worksheet, [], { origin: 'A2', skipHeader: true })
        }
        utils.book_append_sheet(workbook, worksheet, 'AnnualLeaveExceed')
        const fileName = `ALExceed_${dayjs().format('YYYY-MM-DD_HHmmss')}.xlsx`
        writeFile(workbook, fileName)
        toast.update('export-al-exceed', {
          render: exportData.length > 0 ? 'Export AL Exceed successfully' : 'Export AL Exceed successfully (No data)',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      } catch (error) {
        console.error('Export AL Exceed error:', error)
        toast.update('export-al-exceed', {
          render: 'Export AL Exceed failed',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      }
      setIsExportingALExceed(false)
    }
  }, [isExportingALExceed, isFetchingALExceedExport, exportALExceedData])

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
        header: t('ACTIONS'),
        size: 130,
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
        header: t('Employee Code')
      },
      {
        accessorKey: 'EMPLOYEE_NAME',
        header: t('Employee Name'),
        accessorFn: row => `${row.EMPLOYEE_NAME || ''}${row.EMPLOYEE_SURNAME ? ' ' + row.EMPLOYEE_SURNAME : ''}`
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: t('Section')
      },
      {
        accessorKey: 'EMPLOYEE_START_WORK',
        header: t('Start Work'),
        Cell: ({ cell }) => {
          const dateValue = cell.getValue() as string
          return dateValue ? dayjs(dateValue).format('DD-MMM-YYYY') : '-'
        }
      },
      {
        accessorKey: 'LEAVE_TYPE_CODE',
        header: t('Leave Type')
      },
      {
        accessorKey: 'LEAVE_REMAIN_DAY',
        header: t('Leave Remaining')
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
          title={t('Search result')}
          action={
            <Stack direction='row' spacing={2} alignItems='center'>
              <Button
                variant='tonal'
                color='primary'
                onClick={handleExportRemainLeave}
                disabled={isExportingRemainLeave || isFetchingRemainLeaveExport}
                startIcon={
                  isExportingRemainLeave || isFetchingRemainLeaveExport ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : (
                    <FileDownloadIcon />
                  )
                }
              >
                {isExportingRemainLeave || isFetchingRemainLeaveExport ? t('Exporting...') : t('Export Remain Leave')}
              </Button>
              <Divider orientation='vertical' flexItem />
              <Button
                variant='tonal'
                color='success'
                onClick={handleExportALExceed}
                disabled={isExportingALExceed || isFetchingALExceedExport}
                startIcon={
                  isExportingALExceed || isFetchingALExceedExport ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : (
                    <FileDownloadIcon />
                  )
                }
              >
                {isExportingALExceed || isFetchingALExceedExport ? t('Exporting...') : t('Export AL Exceed')}
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
