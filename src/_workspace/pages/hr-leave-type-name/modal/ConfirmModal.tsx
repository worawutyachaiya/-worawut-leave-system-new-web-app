import { forwardRef, ReactElement, Ref } from 'react'

import { Box, Button, CircularProgress, Dialog, DialogContent, Slide, SlideProps, Typography } from '@mui/material'

// Images
import confirmImg from '@/assets/images/common/undraw_notify_re_65on.svg'

import { useTranslation } from '@/contexts/TranslationContext'

// Dialog Transition
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Props
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

const ConfirmModal = ({ open, onClose, onConfirm, isLoading = false }: ConfirmModalProps) => {
  const { t } = useTranslation()
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
          alignItems: 'flex-start'
        },
        zIndex: theme => theme.zIndex.modal + 1
      }}
      PaperProps={{ sx: { top: 30, m: 0 } }}
    >
      <DialogContent sx={{ py: 4, px: 5 }}>
        <Box sx={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          {/* Confirm Image */}
          <Box
            component='img'
            src={confirmImg}
            alt='Confirm'
            sx={{
              width: 150,
              height: 'auto',
              mb: 6
            }}
          />

          {/* Title */}
          <Typography variant='h4' fontWeight='bold' sx={{ mb: 4 }}>
            {t('Are you sure you want to proceed?')}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={onConfirm}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? t('Is Loading...') : t('Yes, Confirm')}
            </Button>
            <Button variant='outlined' color='secondary' onClick={onClose} disabled={isLoading} sx={{ minWidth: 120 }}>
              {t('No, Cancel')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmModal
