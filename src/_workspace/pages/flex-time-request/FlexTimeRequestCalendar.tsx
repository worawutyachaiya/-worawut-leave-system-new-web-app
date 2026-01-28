import { useState, useRef } from 'react'
import { Card, Box, useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import FlexTimeSidebarLeft from './FlexTimeSidebarLeft'
import FlexTimeRequestFormDialog from './modal/FlexTimeRequestFormDialog'
import { useGetFlexTimeByEmployeeId } from '@/_workspace/react-query/hooks/useFlexTime'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import enLocale from '@fullcalendar/core/locales/en-gb'
import thLocale from '@fullcalendar/core/locales/th'
import { useTranslation } from '@/contexts/TranslationContext'
import { toast } from 'react-toastify'
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
const FlexTimeRequestCalendar = () => {
  const { t, locale } = useTranslation()
  const [openForm, setOpenForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [calendarApi, setCalendarApi] = useState<any>(null)
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const calendarRef = useRef<any>(null)
  const userData = getUserData()
  const employeeId = userData?.EMPLOYEE_CODE || ''
  const [dates] = useState({
    startDate: dayjs().startOf('year').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('year').format('YYYY-MM-DD')
  })
  const { data: calendarData, isLoading } = useGetFlexTimeByEmployeeId({
    employeeId,
    startDate: dates.startDate,
    endDate: dates.endDate
  })
  const events = (calendarData?.data?.ResultOnDb || []).map((item: any) => {
    const isHoliday = item.title?.toLowerCase().includes('holiday', 'วันหยุดบริษัท', 'วันหยุดนักขัตฤกษ์')
    return {
      id: item.id?.toString() || `${item.title}-${item.start}`,
      title: t(item.title || 'Leave'),
      start: item.start,
      end: item.end,
      allDay: true,
      extendedProps: { ...item },
      classNames: isHoliday ? ['event-bg-error'] : ['event-bg-primary']
    }
  })
  console.log(events)
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventClick = () => {
    setSelectedDate(dayjs().format('YYYY-MM-DD'))
    setOpenForm(true)
  }
  const handleDateClick = (arg: any) => {
    const clickedDate = dayjs(arg.dateStr)
    const today = dayjs().startOf('day')
    const calApi = calendarRef.current?.getApi()
    const eventsOnDay = calApi?.getEvents().filter((evt: any) => {
      const evtStart = dayjs(evt.start)
      const evtEnd = evt.end ? dayjs(evt.end) : evtStart
      return clickedDate.isSameOrAfter(evtStart, 'day') && clickedDate.isSameOrBefore(evtEnd, 'day')
    })
    const isRestricted = eventsOnDay?.some((evt: any) => {
      const title = evt.title?.toLowerCase() || ''
      return (
        title.includes('holiday') ||
        title.includes('leave') ||
        title.includes('07.30') ||
        title.includes('08.30') ||
        title.includes('09.30') ||
        title.includes('วันหยุดบริษัท') ||
        title.includes('วันหยุดนักขัตฤกษ์')
      )
    })
    if (isRestricted) {
      toast.error('ไม่สามารถทำรายการได้ เนื่องจากมีการลางาน หรือ Flex Time หรือเป็นวันหยุดในวันนี้แล้ว')
      return
    }
    if (clickedDate.isBefore(today)) {
      toast.error('ไม่สามารถทำรายการย้อนหลังได้')
      return
    }
    const now = dayjs()
    const cutoff = dayjs().hour(8).minute(30).second(0)
    if (clickedDate.isSame(today, 'day') && now.isAfter(cutoff)) {
      toast.error('คุณจำเป็นต้องทำรายการก่อน 08:30 น. ของวันที่จะใช้สิทธิ')
      return
    }
    setSelectedDate(arg.dateStr)
    setOpenForm(true)
  }
  return (
    <Card className='overflow-visible'>
      <AppFullCalendar className='app-calendar'>
        <Box sx={{ display: 'flex', minHeight: 650, position: 'relative', overflow: 'clip' }}>
          {/* Sidebar */}
          <FlexTimeSidebarLeft
            mdAbove={mdAbove}
            leftSidebarOpen={leftSidebarOpen}
            handleLeftSidebarToggle={handleLeftSidebarToggle}
            handleAddEventClick={handleAddEventClick}
            calendarApi={calendarRef.current?.getApi()}
          />
          {/* Calendar */}
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
            <FullCalendar
              locale={locale === 'th' ? thLocale : enLocale}
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
              initialView='dayGridMonth'
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{
                start: mdAbove ? 'prev,next title' : 'sidebarToggle,prev,next title',
                end: 'today'
              }}
              customButtons={{
                sidebarToggle: {
                  icon: 'tabler tabler-menu-2',
                  click: handleLeftSidebarToggle
                }
              }}
              height='auto'
              contentHeight='auto'
            />
          </Box>
        </Box>
      </AppFullCalendar>
      {/* Form Dialog */}
      <FlexTimeRequestFormDialog open={openForm} onClose={() => setOpenForm(false)} selectedDate={selectedDate} />
    </Card>
  )
}
export default FlexTimeRequestCalendar
