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
import SubordinateFlexTimeCalendar from './SubordinateFlexTimeCalendar'
import SubordinateFlexTimeSidebar from './SubordinateFlexTimeSidebar'
import ViewToggle from './ViewToggle'
import SubordinateFlexTimeTableSearchFilters from './TableView/SubordinateFlexTimeTableSearchFilters'
import SubordinateFlexTimeTableSearchResult from './TableView/SubordinateFlexTimeTableSearchResult'
import DateDetailModal from './modal/DateDetailModal'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'
import type { FormDataPage } from './validationSchema'
import { fetchDefaultValues, validationSchemaPage } from './validationSchema'
import { useGetSubordinateFlexTimeCalendarEvents } from '@/_workspace/react-query/hooks/useFlexTime'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import dayjs from 'dayjs'
import type { ViewType, FlexTimeCalendarEvent } from '@/_workspace/types/subordinate-flex-time/SubordinateFlexTimeTypes'

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
  const [dateClickModalOpen, setDateClickModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD')
  })

  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const userData = getUserData()

  const { data: eventsData, isLoading } = useGetSubordinateFlexTimeCalendarEvents(
    {
      EMPLOYEE_CODE: employeeCode?.EMPLOYEE_ID || '',
      START_DATE: dateRange.start,
      END_DATE: dateRange.end,
      EMPLOYEE_ID_REQUEST: userData?.EMPLOYEE_CODE || ''
    },
    !!userData?.EMPLOYEE_CODE
  )

  const events: FlexTimeCalendarEvent[] = useMemo(() => {
    const rawEvents = eventsData?.data?.ResultOnDb || []
    return rawEvents.map((event: any) => ({
      id: event.id?.toString() || event.FLEX_TIME_REQUEST_ID?.toString(),
      title: event.title || event.FLEX_TIME_DESCRIPTION || 'Flex Time',
      start: event.start || event.FLEX_TIME_REQUEST_START_DATE,
      end: event.end || event.FLEX_TIME_REQUEST_END_DATE,
      allDay: event.allDay ?? true,
      extendedProps: {
        flexTimeTypeId: event.FLEX_TIME_TYPE_ID,
        status: event.IS_APPROVED,
        ...event
      }
    }))
  }, [eventsData])

  const allEvents = events

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleEventClick = (event: FlexTimeCalendarEvent) => {
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
          <Box sx={{ display: 'flex', minHeight: 600, position: 'relative', overflow: 'clip' }}>
            <SubordinateFlexTimeSidebar
              mdAbove={mdAbove}
              leftSidebarOpen={leftSidebarOpen}
              calendarApi={calendarApi}
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
              <SubordinateFlexTimeCalendar
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
      <SubordinateFlexTimeTableSearchFilters />
      <SubordinateFlexTimeTableSearchResult />
    </>
  )
}

export default Page
