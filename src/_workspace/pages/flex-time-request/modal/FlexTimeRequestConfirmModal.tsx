import { forwardRef, ReactElement, Ref } from 'react'
import { Box, Button, CircularProgress, Dialog, DialogContent, Slide, SlideProps, Typography } from '@mui/material'
import confirmImg from '@/assets/images/common/undraw_notify_re_65on.svg'
import { useTranslation } from '@/contexts/TranslationContext'
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
interface FlexTimeRequestConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}
const FlexTimeRequestConfirmModal = ({
  open,
  onClose,
  onConfirm,
  isLoading = false
}: FlexTimeRequestConfirmModalProps) => {
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
          <Typography variant='h4' fontWeight='bold'>
            {t('Are you sure')} ?
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            ยืนยันการสร้างคำขอ Flex Time หรือไม่ ?
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
              {isLoading ? t('Submitting') : `${t('Yes')}, ${t('Submit')}`}
            </Button>
            <Button variant='outlined' color='secondary' onClick={onClose} disabled={isLoading} sx={{ minWidth: 120 }}>
              {t('No, cancel')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
export default FlexTimeRequestConfirmModal
