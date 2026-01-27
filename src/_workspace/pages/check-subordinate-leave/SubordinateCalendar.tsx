import { useEffect, useRef, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import thLocale from '@fullcalendar/core/locales/th'
import enLocale from '@fullcalendar/core/locales/en-gb'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useTranslation } from '@/contexts/TranslationContext'

dayjs.extend(isSameOrBefore)

const LEAVE_TYPE_COLORS: Record<string, string> = {
  ลาพักร้อน: 'success',
  ลาป่วย: 'error',
  ลากิจ: 'warning',
  ลาทำงานที่บ้าน: 'info',
  ลาพักร้อนฉุกเฉิน: 'warning',
  ลาอื่นๆ: 'secondary',
  ลาพิเศษ: 'primary',
  ลาวันเกิด: 'success',
  ลาเพื่อฌาปนกิจ: 'error',
  ลาแต่งงาน: 'success',
  Holiday: 'error',
  'Company Holiday': 'error',
  'Traditional Holiday': 'error',
  'Substitution Holiday': 'error',
  'Annual Leave': 'primary',
  'Birthday Leave': 'success',
  'Business Leave': 'primary',
  'Funeral Leave': 'secondary',
  'Marriage Leave': 'success',
  'Maternity Leave': 'success',
  'Military Leave': 'success',
  'Priesthood Leave': 'secondary',
  'Sick Leave': 'warning',
  'Special Leave': 'warning',
  'Work from home': 'info',
  'Annual Leave Emergency': 'warning',
  'Other Leave': 'secondary',
  'Vaccine Covid Leave': 'info',
  default: 'primary'
}

import type { CalendarEvent } from '@/_workspace/types/check-sorbordinate-leave/CheckSubordinateLeaveTypes'

const processEvents = (events: CalendarEvent[], t: (key: string) => string): CalendarEvent[] => {
  const processedEvents: CalendarEvent[] = []

  events.forEach(event => {
    const isHoliday =
      event.extendedProps?.isHoliday ||
      (event.title && event.title.toLowerCase().includes('holiday')) ||
      (event.extendedProps?.leaveType && event.extendedProps.leaveType.toLowerCase().includes('holiday'))

    const rawTitle =
      event.title || event.extendedProps?.LEAVE_TYPE_DESCRIPTION_EN || event.extendedProps?.leaveType || 'Leave'
    const title = t(rawTitle)

    if (isHoliday) {
      processedEvents.push({
        ...event,
        title,
        start: dayjs(event.start).format('YYYY-MM-DD'),
        end: dayjs(event.end).format('YYYY-MM-DD'),
        allDay: true
      })
    } else {
      let startDate = dayjs(event.start)
      const endDate = dayjs(event.end)

      while (startDate.isSameOrBefore(endDate, 'day')) {
        processedEvents.push({
          id: `${event.id}-${startDate.format('YYYY-MM-DD')}`,
          title,
          start: startDate.format('YYYY-MM-DD'),
          end: startDate.format('YYYY-MM-DD'),
          allDay: event.allDay ?? false,
          extendedProps: {
            ...event.extendedProps,
            leaveType: event.extendedProps?.leaveType || event.extendedProps?.LEAVE_TYPE_DESCRIPTION_EN,
            originalEventId: event.id
          }
        })
        startDate = startDate.add(1, 'day')
      }
    }
  })

  return processedEvents
}

interface Props {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onDatesSet?: (arg: any) => void
  calendarApi: any
  setCalendarApi: (api: any) => void
  handleLeftSidebarToggle: () => void
}

function SubordinateCalendar({
  events,
  onEventClick,
  onDateClick,
  onDatesSet,
  calendarApi,
  setCalendarApi,
  handleLeftSidebarToggle
}: Props) {
  const { t, locale } = useTranslation()
  const calendarRef = useRef<any>(null)
  const theme = useTheme()

  useEffect(() => {
    if (calendarApi === null && calendarRef.current) {
      setCalendarApi(calendarRef.current.getApi())
    }
  }, [calendarApi, setCalendarApi])

  const getEventColor = (leaveType: string): string => {
    return LEAVE_TYPE_COLORS[leaveType] || LEAVE_TYPE_COLORS['default']
  }

  const processedEvents = useMemo(() => processEvents(events, t), [events, t])

  const calendarOptions: CalendarOptions = {
    events: processedEvents as EventInput[],
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: locale === 'th' ? thLocale : enLocale,
    headerToolbar: {
      start: 'sidebarToggle, prev, next, title',
      end: 'dayGridMonth,timeGridWeek,listMonth'
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },
    displayEventTime: false,
    eventDisplay: 'block',
    editable: false,
    dayMaxEvents: 3,
    navLinks: true,
    height: 'auto',
    eventClassNames({ event: calendarEvent }: any) {
      const leaveType = calendarEvent._def.extendedProps?.leaveType || ''
      const colorName = getEventColor(leaveType)
      return [`event-bg-${colorName}`]
    },
    eventClick({ event: clickedEvent, jsEvent }: any) {
      jsEvent.preventDefault()
      if (onEventClick) {
        onEventClick({
          id: clickedEvent.id,
          title: clickedEvent.title,
          start: clickedEvent.startStr,
          end: clickedEvent.endStr,
          allDay: clickedEvent.allDay,
          extendedProps: clickedEvent.extendedProps
        })
      }
    },
    datesSet(arg: any) {
      if (onDatesSet) {
        onDatesSet(arg)
      }
    },
    customButtons: {
      sidebarToggle: {
        icon: 'tabler tabler-menu-2',
        click() {
          handleLeftSidebarToggle()
        }
      }
    },
    dateClick(info: any) {
      if (onDateClick) {
        onDateClick(info.date)
      }
    },
    direction: theme.direction
  }

  return <FullCalendar ref={calendarRef} {...calendarOptions} height='auto' contentHeight='auto' />
}

export default SubordinateCalendar
