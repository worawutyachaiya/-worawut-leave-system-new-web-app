// React Imports
import { forwardRef, ReactElement, Ref, ReactNode } from 'react'

// MUI Imports
import { Button, Dialog, DialogContent, Typography, Box, type SlideProps, Slide, CircularProgress } from '@mui/material'

// Assets
import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'

import { useTranslation } from '@/contexts/TranslationContext'

// Dialog Transition
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  title?: string
  content?: string | ReactNode
}

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  loading,
  title = 'Delete Confirmation',
  content = 'Are you sure you want to delete this item?'
}: Props) => {
  const { t } = useTranslation()
  return (
    <Dialog
      maxWidth='xs'
      fullWidth
      open={open}
      onClose={onClose}
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
          {/* Delete Illustration */}
          <Box
            component='img'
            src={undraw_clean_up_re_504g}
            alt='Delete'
            sx={{
              width: 150,
              height: 'auto',
              mb: 6
            }}
          />

          {/* Title */}
          <Typography variant='h4' fontWeight='bold'>
            Are You Sure ?
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            ยืนยันการลบข้อมูลหรือไม่ ?
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              type='button'
              onClick={onConfirm}
              color='error'
              variant='contained'
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ minWidth: 120 }}
            >
              {loading ? t('Deleting...') : t('Yes, Delete !')}
            </Button>
            <Button onClick={onClose} color='secondary' variant='outlined' disabled={loading} sx={{ minWidth: 120 }}>
              {t('No, Keep it')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmDialog
