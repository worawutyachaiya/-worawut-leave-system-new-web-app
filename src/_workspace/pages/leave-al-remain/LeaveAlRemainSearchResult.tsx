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
import 'dayjs/locale/th'
import { useSettings } from '@/@core/hooks/useSettings'
import { useCheckPermission } from '@/_template/CheckPermission'
import { useDxContext } from '@/_template/DxContextProvider'
import { DxMRTTable } from '@/_template/DxMRTTable'
import { useSearchRemainALInFlow } from '@/_workspace/react-query/hooks/useLeaveAlRemain'
import { LeaveAlRemainSearchParams } from '@/_workspace/types/leave-employee-information/LeaveEmployeeInformationInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { FormDataPage } from './validationSchema'
import { MENU_ID } from './env'
import { LeaveAlRemainInterface } from '@/_workspace/types/leave-employee-information/LeaveEmployeeInformationInterface'
import { useTranslation } from '@/contexts/TranslationContext'

function SearchResult() {
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const { settings } = useSettings()
  const checkPermission = useCheckPermission()
  const [rowSelected, setRowSelected] = useState<MRT_Row<LeaveAlRemainInterface> | null>(null)
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
  const paramForSearch: LeaveAlRemainSearchParams = {
    EMPLOYEE_SECTION: getValues('searchFilters.section')?.SECTION || '',
    EMPLOYEE_NAME: getValues('searchFilters.employeeName') || '',
    INUSE: 1,
    EMPLOYEE_CODE: getValues('searchFilters.employeeCode') || '',
    EMPLOYEE_ID_REQUEST: getUserData()?.EMPLOYEE_CODE || '',
    Start: pagination.pageIndex * pagination.pageSize,
    Limit: pagination.pageSize,
    Order: sorting
  }
  const { isRefetching, isLoading, data, isError, isFetching, refetch } = useSearchRemainALInFlow(
    paramForSearch,
    isEnableFetching
  )
  const getTableData = (): LeaveAlRemainInterface[] => {
    if (data?.data?.ResultOnDb?.[1]) {
      return data.data.ResultOnDb[1] as unknown as LeaveAlRemainInterface[]
    }
    if (Array.isArray(data?.data?.ResultOnDb)) {
      return data.data.ResultOnDb as unknown as LeaveAlRemainInterface[]
    }
    return []
  }
  const getTotalCount = (): number => {
    if (
      Array.isArray(data?.data?.ResultOnDb?.[0]) &&
      data.data.ResultOnDb[0][0] &&
      'TOTAL_COUNT' in data.data.ResultOnDb[0][0]
    ) {
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
  const columns = useMemo<MRT_ColumnDef<LeaveAlRemainInterface>[]>(
    () => [
      {
        accessorKey: 'EMPLOYEE_CODE',
        header: t('Employee Code'),
        size: 220,
        enableSorting: false
      },
      {
        id: 'EMPLOYEE_FULL_NAME',
        enableSorting: false,
        header: t('Employee Name'),
        accessorFn: row => `${row.EMPLOYEE_NAME || ''}${row.EMPLOYEE_SURNAME ? ' ' + row.EMPLOYEE_SURNAME : ''}`,
        size: 350
      },
      {
        accessorKey: 'EMPLOYEE_SECTION',
        header: t('Section'),
        size: 160,
        enableSorting: false
      },
      {
        accessorKey: 'EMPLOYEE_START_WORK',
        // enableSorting: false,

        header: t('Start Work'),
        size: 200,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>()
          return value ? dayjs(value).format('DD-MMM-YYYY') : '-'
        }
      },
      {
        accessorKey: 'REMAIN_AL',
        header: t('AL Available'),
        enableSorting: false,

        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ cell }) => {
          const v = cell.getValue<any>()
          return v === null || v === undefined || v === '' ? 0 : v
        }
      },
      {
        accessorKey: 'REMAIN_AL_EMERGENCY',
        enableSorting: false,

        header: t('AL Emergency Remaining'),
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ cell }) => {
          const v = cell.getValue<any>()
          return v === null || v === undefined || v === '' ? 0 : v
        }
      }
    ],
    [settings.mode, t]
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
        <CardHeader title={t('Search result')} />
        {/* Modal Area (ถ้ามี) */}
        {/* {openModalAdd && <LeaveHistoryModal openModal={openModalAdd} setOpenModal={setOpenModalAdd} mode='Add' />} */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DxMRTTable
            enableRowActions={false}
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
          />
        </LocalizationProvider>
      </Card>
    </>
  )
}
export default SearchResult
