import { useTranslation } from '@/contexts/TranslationContext'
import { Button, Drawer, Divider, Typography, FormControlLabel, Checkbox } from '@mui/material'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import classnames from 'classnames'
import { th, enGB } from 'date-fns/locale'
import type { ThemeColor } from '@core/types'

export type CalendarFilterType = 'Flex Time' | 'Holiday'

export const calendarsColor: Record<CalendarFilterType, ThemeColor> = {
  'Flex Time': 'primary',
  Holiday: 'error'
}

interface Props {
  mdAbove: boolean
  leftSidebarOpen: boolean
  handleLeftSidebarToggle: () => void
  handleAddEventClick: () => void
  calendarApi: any

  selectedCalendars: CalendarFilterType[]
  onFilterChange: (filter: CalendarFilterType) => void
  onFilterAllChange: (checked: boolean) => void
}

const FlexTimeSidebarLeft = ({
  mdAbove,
  leftSidebarOpen,
  handleLeftSidebarToggle,
  handleAddEventClick,
  calendarApi,
  selectedCalendars,
  onFilterChange,
  onFilterAllChange
}: Props) => {
  const { t, locale } = useTranslation()

  // สร้าง array จาก calendarsColor object
  const colorsArr = Object.entries(calendarsColor) as [CalendarFilterType, ThemeColor][]

  // Render filter checkboxes
  const renderFilters = colorsArr.map(([key, value]) => (
    <FormControlLabel
      key={key}
      className='mbe-1'
      label={t(key)}
      control={
        <Checkbox color={value} checked={selectedCalendars.includes(key)} onChange={() => onFilterChange(key)} />
      }
    />
  ))

  return (
    <Drawer
      open={leftSidebarOpen}
      onClose={handleLeftSidebarToggle}
      variant={mdAbove ? 'permanent' : 'temporary'}
      ModalProps={{
        disablePortal: true,
        disableAutoFocus: true,
        disableScrollLock: true,
        keepMounted: true
      }}
      className={classnames('block', { static: mdAbove, absolute: !mdAbove })}
      PaperProps={{
        className: classnames('items-start is-[280px] shadow-none rounded rounded-se-none rounded-ee-none', {
          static: mdAbove,
          absolute: !mdAbove
        })
      }}
      sx={{
        zIndex: 10,
        '& .MuiDrawer-paper': {
          zIndex: mdAbove ? 2 : 'drawer'
        },
        '& .MuiBackdrop-root': {
          borderRadius: 1,
          position: 'absolute'
        }
      }}
    >
      <div className='is-full' style={{ padding: '1.34rem' }}>
        <Button fullWidth variant='contained' onClick={handleAddEventClick} startIcon={<i className='tabler-plus' />}>
          {t('Flex Time Request')}
        </Button>
      </div>
      <Divider className='is-full' />
      <AppReactDatepicker
        inline
        locale={locale === 'th' ? th : enGB}
        onChange={(date: Date | null) => date && calendarApi?.gotoDate(date)}
        boxProps={{
          className: 'flex justify-center is-full',
          sx: {
            '& .react-datepicker': {
              boxShadow: 'none !important',
              border: 'none !important'
            }
          }
        }}
      />
      <Divider className='is-full' />
      <div className='flex flex-col p-6 is-full'>
        <Typography variant='h5' className='mbe-4'>
          {t('Event Filters')}
        </Typography>
        <FormControlLabel
          className='mbe-1'
          label={t('View All')}
          control={
            <Checkbox
              color='secondary'
              checked={selectedCalendars.length === colorsArr.length}
              onChange={e => onFilterAllChange(e.target.checked)}
            />
          }
        />
        {renderFilters}
      </div>
    </Drawer>
  )
}

export default FlexTimeSidebarLeft
