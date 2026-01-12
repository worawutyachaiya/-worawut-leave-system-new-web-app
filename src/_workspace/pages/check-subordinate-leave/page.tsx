import { useState, useMemo } from 'react'
import { Grid, Card, Box, useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import { FormProvider, useForm, useFormContext, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import SubordinateCalendar from './SubordinateCalendar'
import SubordinateSidebar from './SubordinateSidebar'
import DateDetailModal from './modal/DateDetailModal'
import ViewToggle from './ViewToggle'
import type {
  CalendarEvent,
  FilterOption,
  ViewType
} from '@/_workspace/types/check-sorbordinate-leave/CheckSubordinateLeaveTypes'
import SubordinateSearchFilters from './TableView/SubordinateSearchFilters'
import SubordinateSearchResult from './TableView/SubordinateSearchResult'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'
import type { FormDataPage } from './validationSchema'
import { fetchDefaultValues, validationSchemaPage } from './validationSchema'
import { useGetCalendarEvents } from '@/_workspace/react-query/hooks/useCheckSubordinateLeave'
import { useLeaveHolidayCompany } from '@/_workspace/react-query/hooks/useLeaveHolidayCompany'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import dayjs from 'dayjs'

const INITIAL_FILTERS: FilterOption[] = [
  { value: 'Annual Leave', label: 'ลาพักร้อน', color: 'success', checked: true },
  { value: 'Sick Leave', label: 'ลาป่วย', color: 'error', checked: true },
  { value: 'Business Leave', label: 'ลากิจ', color: 'warning', checked: true },
  { value: 'Work from home', label: 'ลาทำงานที่บ้าน (WFH)', color: 'info', checked: true },
  { value: 'Birthday Leave', label: 'ลาวันเกิด', color: 'success', checked: true },
  { value: 'Annual Leave Emergency', label: 'ลาพักร้อนฉุกเฉิน', color: 'warning', checked: true },
  { value: 'Special Leave', label: 'ลาพิเศษ', color: 'warning', checked: true },
  { value: 'Funeral Leave', label: 'ลาเพื่อฌาปนกิจ', color: 'secondary', checked: true },
  { value: 'Marriage Leave', label: 'ลาแต่งงาน', color: 'success', checked: true },
  { value: 'Maternity Leave', label: 'ลาคลอด', color: 'success', checked: true },
  { value: 'Military Leave', label: 'ลารับราชการทหาร', color: 'success', checked: true },
  { value: 'Priesthood Leave', label: 'ลาบวช', color: 'secondary', checked: true },
  { value: 'Other Leave', label: 'ลาอื่นๆ', color: 'secondary', checked: true },
  { value: 'Vaccine Covid Leave', label: 'ลาฉีดวัคซีน', color: 'info', checked: true }
]

function Page() {
  return (
    <DxProvider>
      <InnerApp />
    </DxProvider>
  )
}

const InnerApp = () => {
  const { setIsEnableFetching } = useDxContext()
  const [activeView, setActiveView] = useState<ViewType>('calendar')
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: async () => fetchDefaultValues(MENU_ID)
  })
  const { control, getValues } = reactHookFormMethods
  const { isLoading: isLoadingReactHookForm } = useFormState({
    control: control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoadingReactHookForm])

  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
  }

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            {isLoadingReactHookForm === false && (
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  employeeCode: getValues('searchFilters.employeeCode'),
                  tableEmployeeCode: getValues('searchFilters.tableEmployeeCode'),
                  tableEmployeeName: getValues('searchFilters.tableEmployeeName'),
                  tableSection: getValues('searchFilters.tableSection')
                }}
              />
            )}
          </Box>
          <ViewToggle activeView={activeView} onViewChange={handleViewChange} />
        </Grid>
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : activeView === 'calendar' ? (
            <CalendarContent />
          ) : (
            <TableContent />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

const CalendarContent = () => {
  const { watch } = useFormContext<FormDataPage>()
  const employeeCode = watch('searchFilters.employeeCode')
  const [calendarApi, setCalendarApi] = useState<any>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOption[]>(INITIAL_FILTERS)
  const [dateClickModalOpen, setDateClickModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD')
  })

  const userData = getUserData()
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const { data: eventsData, isLoading } = useGetCalendarEvents({
    START_DATE: dateRange.start,
    END_DATE: dateRange.end,
    EMPLOYEE_ID_REQUEST: userData?.EMPLOYEE_CODE || '',
    EMPLOYEE_CODE: employeeCode?.EMPLOYEE_ID || ''
  })

  // Map events from API to include proper title and leaveType
  const events: CalendarEvent[] = useMemo(() => {
    const rawEvents = eventsData?.data?.ResultOnDb || []
    return rawEvents.map((event: any) => ({
      id: event.id?.toString() || event.LEAVE_REQUEST_ID?.toString(),
      title: event.extendedProps?.LEAVE_TYPE_DESCRIPTION_EN || event.title || 'Leave',
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      extendedProps: {
        ...event.extendedProps,
        leaveType: event.extendedProps?.LEAVE_TYPE_DESCRIPTION_EN || event.extendedProps?.leaveType,
        employeeCode: event.extendedProps?.EMPLOYEE_CODE || event.extendedProps?.employeeCode
      }
    }))
  }, [eventsData])

  const { data: holidayData, isLoading: isLoadingHolidays } = useLeaveHolidayCompany({}, true)

  const holidayEvents: CalendarEvent[] = useMemo(() => {
    const holidays = holidayData?.data?.ResultOnDb || []
    return holidays.map((holiday: any, index: number) => ({
      id: `holiday-${index}`,
      title: holiday.title_holiday || 'Company Holiday',
      start: holiday.day_holiday,
      end: holiday.day_holiday,
      allDay: true,
      extendedProps: {
        leaveType: 'Company Holiday',
        isHoliday: true,
        holidayType: holiday.title_holiday || 'Company Holiday'
      }
    }))
  }, [holidayData])

  const filteredEvents = useMemo(() => {
    const activeFilters = filters.filter(f => f.checked).map(f => f.value)
    const result = events.filter(event => {
      const leaveType = event.extendedProps?.leaveType || ''
      return activeFilters.includes(leaveType)
    })
    // Note: Employee filter is now handled by backend
    return result
  }, [filters, events])

  const allEvents = useMemo(() => {
    return [...filteredEvents, ...holidayEvents]
  }, [filteredEvents, holidayEvents])

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleFilterChange = (value: string, checked: boolean) => {
    setFilters(prev => prev.map(f => (f.value === value ? { ...f, checked } : f)))
  }

  const handleFilterAllChange = (checked: boolean) => {
    setFilters(prev => prev.map(f => ({ ...f, checked })))
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(new Date(event.start))
    setDateClickModalOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setDateClickModalOpen(true)
  }

  const handleDateModalClose = () => {
    setDateClickModalOpen(false)
    setSelectedDate(null)
  }

  const handleDatesSet = (arg: any) => {
    const start = dayjs(arg.start).format('YYYY-MM-DD')
    const end = dayjs(arg.end).format('YYYY-MM-DD')
    setDateRange({ start, end })
  }

  return (
    <>
      <Card className='overflow-visible'>
        <AppFullCalendar className='app-calendar'>
          <Box sx={{ display: 'flex', minHeight: 600 }}>
            <SubordinateSidebar
              mdAbove={mdAbove}
              leftSidebarOpen={leftSidebarOpen}
              calendarApi={calendarApi}
              filters={filters}
              onFilterChange={handleFilterChange}
              onFilterAllChange={handleFilterAllChange}
              handleLeftSidebarToggle={handleLeftSidebarToggle}
            />
            <Box
              sx={{
                flexGrow: 1,
                px: 6,
                pt: 6,
                '& .fc-col-header-cell': {
                  backgroundColor: 'var(--mui-palette-background-paper) !important'
                },
                '& .fc-timegrid-axis': {
                  backgroundColor: 'var(--mui-palette-background-paper) !important'
                },
                '& .fc-scrollgrid-section-header': {
                  '& td, & th': {
                    backgroundColor: 'var(--mui-palette-background-paper) !important'
                  }
                }
              }}
            >
              <SubordinateCalendar
                events={allEvents}
                calendarApi={calendarApi}
                setCalendarApi={setCalendarApi}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                handleLeftSidebarToggle={handleLeftSidebarToggle}
                onDatesSet={handleDatesSet}
              />
            </Box>
          </Box>
        </AppFullCalendar>
      </Card>
      <DateDetailModal open={dateClickModalOpen} onClose={handleDateModalClose} date={selectedDate} />
    </>
  )
}

const TableContent = () => {
  return (
    <>
      <SubordinateSearchFilters />
      <SubordinateSearchResult />
    </>
  )
}

export default Page
