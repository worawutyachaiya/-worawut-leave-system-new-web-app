import type { EventInput } from '@fullcalendar/core'
import type { ThemeColor } from '@core/types'
export type CalendarFiltersType = 'Personal' | 'Business' | 'Family' | 'Holiday' | 'ETC'
export type CalendarColors = {
  ETC: ThemeColor
  Family: ThemeColor
  Holiday: ThemeColor
  Personal: ThemeColor
  Business: ThemeColor
}
export type CalendarType = {
  events: EventInput[]
  filteredEvents: EventInput[]
  selectedEvent: null | any
  selectedCalendars: CalendarFiltersType[]
}
export type AddEventType = Omit<EventInput, 'id'>
export interface CalendarEventParams {
  title: string
  start: string | Date
  end: string | Date
  allDay?: boolean
  url?: string
  extendedProps?: {
    calendar?: CalendarFiltersType
    guests?: string[]
    description?: string
  }
}
export interface CalendarEventUpdateParams extends CalendarEventParams {
  id: string | number
}
export interface CalendarEventDeleteParams {
  id: string | number
}
export interface CalendarState {
  events: EventInput[]
  filteredEvents: EventInput[]
  selectedEvent: EventInput | AddEventType | null
  selectedCalendars: CalendarFiltersType[]
}
export interface CalendarEventsResponse {
  data: EventInput[]
  status: number
}
export type SidebarLeftProps = {
  mdAbove: boolean
  calendarApi: any
  calendarStore: CalendarState
  leftSidebarOpen: boolean
  calendarsColor: CalendarColors
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
  selectedCalendars: CalendarFiltersType[]
  onFilterChange: (filter: CalendarFiltersType) => void
  onFilterAllChange: (checked: boolean) => void
}
export type AddEventSidebarType = {
  calendarStore: CalendarState
  calendarApi: any
  addEventSidebarOpen: boolean
  handleAddEventSidebarToggle: () => void
  onAddEvent: (event: CalendarEventParams) => void
  onUpdateEvent: (event: CalendarEventUpdateParams) => void
  onDeleteEvent: (id: string | number) => void
}
export type CalendarProps = {
  calendarStore: CalendarState
  calendarApi: any
  setCalendarApi: (val: any) => void
  calendarsColor: CalendarColors
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
  onEventUpdate: (event: CalendarEventUpdateParams) => void
  onEventSelect: (event: EventInput | AddEventType | null) => void
}
