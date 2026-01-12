import { forwardRef, ReactElement, Ref } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import type { SlideProps } from '@mui/material'
import { Slide } from '@mui/material'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import { useTranslation } from '@/contexts/TranslationContext'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface HrCheckConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
  selectedCount: number
}

const HrCheckConfirmModal = ({ open, onClose, onConfirm, isLoading, selectedCount }: HrCheckConfirmModalProps) => {
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
        }
      }}
      PaperProps={{ sx: { top: 30, m: 0 } }}
    >
      <DialogContent sx={{ py: 4, px: 5 }}>
        <Box sx={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 6 }}>
            <CheckCircleOutlined sx={{ fontSize: 100, color: 'success.main' }} />
          </Box>
          <Typography variant='h4' fontWeight='bold'>
            {t('Confirm HR Check')}
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            {t('Are you sure you want to check')} {selectedCount} {t('selected items?')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              variant='contained'
              color='success'
              sx={{ minWidth: 120 }}
              startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
            >
              {isLoading ? t('Checking...') : t('Yes, Check')}
            </Button>
            <Button variant='outlined' color='secondary' onClick={onClose} disabled={isLoading} sx={{ minWidth: 120 }}>
              {t('Cancel')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default HrCheckConfirmModal
