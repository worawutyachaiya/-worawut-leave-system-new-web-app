import { useTranslation } from '@/contexts/TranslationContext'
import { Button, Drawer, Divider } from '@mui/material'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import classnames from 'classnames'
import { th, enGB } from 'date-fns/locale'

interface Props {
  mdAbove: boolean
  leftSidebarOpen: boolean
  handleLeftSidebarToggle: () => void
  handleAddEventClick: () => void
  calendarApi: any
}

const FlexTimeSidebarLeft = ({
  mdAbove,
  leftSidebarOpen,
  handleLeftSidebarToggle,
  handleAddEventClick,
  calendarApi
}: Props) => {
  const { t, locale } = useTranslation()

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
    </Drawer>
  )
}

export default FlexTimeSidebarLeft
