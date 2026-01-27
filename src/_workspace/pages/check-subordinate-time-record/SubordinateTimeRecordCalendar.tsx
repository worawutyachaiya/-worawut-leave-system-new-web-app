import { useEffect, useRef, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import type { FlexTimeCalendarEvent } from '@/_workspace/types/subordinate-flex-time/SubordinateFlexTimeTypes'

dayjs.extend(isSameOrBefore)

const FLEX_TIME_COLORS: Record<string, string> = {
  '07.30-16.30': 'primary',
  '07:30 - 16:30': 'primary',
  '08.30-17.30': 'success',
  '08:30 - 17:30': 'success',
  '09.30-18.30': 'info',
  '09:30 - 18:30': 'info',
  'Company Holiday': 'error',
  'Traditional Holiday': 'error',
  'Substitution Holiday': 'error',
  default: 'primary'
}

const processEvents = (events: FlexTimeCalendarEvent[]): FlexTimeCalendarEvent[] => {
  const processedEvents: FlexTimeCalendarEvent[] = []

  events.forEach(event => {
    const isHoliday =
      event.extendedProps?.isHoliday ||
      (event.title && event.title.toLowerCase().includes('holiday')) ||
      (event.extendedProps?.holidayType && event.extendedProps.holidayType.toLowerCase().includes('holiday'))

    const title = event.title || 'Flex Time'

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
  events: FlexTimeCalendarEvent[]
  onEventClick?: (event: FlexTimeCalendarEvent) => void
  onDateClick?: (date: Date) => void
  onDatesSet?: (arg: any) => void
  calendarApi: any
  setCalendarApi: (api: any) => void
  handleLeftSidebarToggle: () => void
}

function SubordinateFlexTimeCalendar({
  events,
  onEventClick,
  onDateClick,
  onDatesSet,
  calendarApi,
  setCalendarApi,
  handleLeftSidebarToggle
}: Props) {
  const calendarRef = useRef<any>(null)
  const theme = useTheme()

  useEffect(() => {
    if (calendarApi === null && calendarRef.current) {
      setCalendarApi(calendarRef.current.getApi())
    }
  }, [calendarApi, setCalendarApi])

  const getEventColor = (title: string): string => {
    return FLEX_TIME_COLORS[title] || FLEX_TIME_COLORS['default']
  }

  const processedEvents = useMemo(() => processEvents(events), [events])

  const calendarOptions: CalendarOptions = {
    events: processedEvents as EventInput[],
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
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
      const title = calendarEvent._def.title || ''
      const colorName = getEventColor(title)
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

export default SubordinateFlexTimeCalendar
