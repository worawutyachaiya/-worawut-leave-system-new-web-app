import { useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material'
import dayjs from 'dayjs'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { useGetSubordinateFlexTimeCalendarEvents } from '@/_workspace/react-query/hooks/useFlexTime'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useFormContext } from 'react-hook-form'
import type { FormDataPage } from '../validationSchema'
import { useTranslation } from '@/contexts/TranslationContext'

interface Props {
  open: boolean
  onClose: () => void
  date: Date | null
}

function DateDetailModal({ open, onClose, date }: Props) {
  const { t } = useTranslation()
  const userData = getUserData()
  const { watch } = useFormContext<FormDataPage>()
  const employeeCode = watch('searchFilters.employeeCode')
  const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : ''

  const { data, isLoading } = useGetSubordinateFlexTimeCalendarEvents(
    {
      START_DATE: formattedDate,
      END_DATE: formattedDate,
      EMPLOYEE_CODE: employeeCode?.EMPLOYEE_ID || '',
      EMPLOYEE_ID_REQUEST: userData?.EMPLOYEE_CODE || ''
    },
    open && !!date
  )

  const eventsForDate = useMemo(() => {
    const rawEvents = (data?.data?.ResultOnDb || []) as any[]
    return rawEvents
      .filter(event => event.display !== 'background' && !!event.FLEX_TIME_REQUEST_EMPLOYEE_CODE)
      .filter(
        (event, index, self) => index === self.findIndex(t => t.FLEX_TIME_REQUEST_ID === event.FLEX_TIME_REQUEST_ID)
      )
  }, [data])

  const displayDate = date ? dayjs(date).format('DD MMM YYYY') : ''

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'center' }
      }}
    >
      <DialogTitle>
        {t('Employee Flex Time On')} {displayDate}
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : eventsForDate.length > 0 ? (
          <Box component='ul' sx={{ pl: 3, m: 0 }}>
            {eventsForDate.map((item, index) => (
              <Typography component='li' key={`flex-time-${index}`} sx={{ mb: 1, lineHeight: 1.8 }}>
                {item.FLEX_TIME_REQUEST_EMPLOYEE_CODE || item.FLEX_TIME_REQUEST_EMPLOYEE_ID || '-'}{' '}
                {item.EMPLOYEE_NAME || ''} {item.EMPLOYEE_DEPT || ''}
                {' - '}
                {item.title || item.FLEX_TIME_DESCRIPTION || 'Flex Time'}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography>{t('No data')}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary' variant='tonal'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DateDetailModal
