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
import { useGetCalendarEventsByDate } from '@/_workspace/react-query/hooks/useCheckSubordinateLeave'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { CalendarEvent } from '@/_workspace/types/check-sorbordinate-leave/CheckSubordinateLeaveTypes'

interface Props {
  open: boolean
  onClose: () => void
  date: Date | null
  events?: CalendarEvent[] // Optional now, or removed if handled internally
  isLoading?: boolean // Optional
}

function DateDetailModal({ open, onClose, date }: Props) {
  const userData = getUserData()
  const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : ''

  const { data, isLoading } = useGetCalendarEventsByDate(
    {
      TARGET_DATE: formattedDate,
      EMPLOYEE_ID_REQUEST: userData?.EMPLOYEE_CODE || ''
    },
    open && !!date
  )

  const eventsForDate = (data?.data?.ResultOnDb || []) as any[]

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
        Employee Leave On {displayDate}
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
          <Box component='ol' sx={{ pl: 3, m: 0 }}>
            {eventsForDate.map((leave, index) => (
              <Typography component='li' key={`leave-${index}`} sx={{ mb: 1, lineHeight: 1.8 }}>
                {leave.EMPLOYEE_CODE || '-'} {leave.EMPLOYEE_NAME || ''} {leave.EMPLOYEE_DEPT || ''}
                {' - '}
                {leave.LEAVE_TYPE_DESCRIPTION_TH || 'Leave'}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography>No Result Found.</Typography>
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
