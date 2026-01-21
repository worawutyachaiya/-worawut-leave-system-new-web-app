import { forwardRef, ReactElement, Ref } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Slide,
  SlideProps,
  Typography,
  useTheme
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorIcon from '@mui/icons-material/Error'
import { useTranslation } from '@/contexts/TranslationContext'
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
export type MessageType = 'success' | 'warning' | 'error'
interface TimeRecordSuccessModalProps {
  open: boolean
  onClose: () => void
  message?: string
  title?: string
  type?: MessageType
  isLoading?: boolean
}
const TimeRecordSuccessModal = ({
  open,
  onClose,
  message = 'Time record request submitted successfully',
  title,
  type = 'success',
  isLoading = false
}: TimeRecordSuccessModalProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 100, color: theme.palette.success.main }} />,
          color: theme.palette.success.main,
          defaultTitle: t('Request successfully') + ' !'
        }
      case 'warning':
        return {
          icon: <WarningAmberIcon sx={{ fontSize: 100, color: theme.palette.warning.main }} />,
          color: theme.palette.warning.main,
          defaultTitle: t('Warning') + ' !'
        }
      case 'error':
        return {
          icon: <ErrorIcon sx={{ fontSize: 100, color: theme.palette.error.main }} />,
          color: theme.palette.error.main,
          defaultTitle: t('Error') + ' !'
        }
      default:
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 100, color: theme.palette.success.main }} />,
          color: theme.palette.success.main,
          defaultTitle: t('Request successfully') + ' !'
        }
    }
  }
  const { icon, color, defaultTitle } = getIconAndColor()
  const getButtonColor = (): 'success' | 'warning' | 'error' | 'primary' => {
    switch (type) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'primary'
    }
  }
  return (
    <Dialog
      maxWidth='xs'
      fullWidth
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && !isLoading) {
          onClose()
        }
      }}
      TransitionComponent={Transition}
      keepMounted
      sx={{
        '& .MuiDialog-paper': {
          overflow: 'visible',
          borderRadius: 2
        },
        '& .MuiDialog-container': {
          justifyContent: 'center',
          alignItems: 'center'
        }
      }}
    >
      <DialogContent sx={{ py: 8, px: 5 }}>
        <Box sx={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          {/* Icon */}
          <Box sx={{ mb: 3 }}>{icon}</Box>
          {/* Title */}
          <Typography variant='h4' fontWeight='bold' sx={{ mb: 2, color: color }}>
            {title || defaultTitle}
          </Typography>
          {/* Message */}
          {message && (
            <Typography variant='body1' color='textSecondary' sx={{ mb: 3 }}>
              {message}
            </Typography>
          )}
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              variant='contained'
              color={getButtonColor()}
              onClick={onClose}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? t('Processing...') : t('OK')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
export default TimeRecordSuccessModal
