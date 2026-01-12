// React Imports
import { forwardRef, ReactElement, Ref } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Slide from '@mui/material/Slide'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { TransitionProps } from '@mui/material/transitions'
import LoadingButton from '@mui/lab/LoadingButton'

// Assets
import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  content?: string
  loading?: boolean
}

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  content = "You won't be able to revert this!",
  loading = false
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog
      maxWidth='xs'
      fullWidth
      open={open}
      keepMounted
      onClose={onClose}
      TransitionComponent={Transition}
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
            {t('Are You Sure ?')}
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            {t('Confirm delete this Flex Time request ?')}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <LoadingButton
              variant='contained'
              color='error'
              onClick={onConfirm}
              loading={loading}
              loadingIndicator={t('Deleting...')}
              sx={{ minWidth: 120 }}
            >
              <span>{t('Yes, Delete !')}</span>
            </LoadingButton>
            <Button variant='outlined' color='secondary' onClick={onClose} disabled={loading} sx={{ minWidth: 120 }}>
              {t('No, Keep it')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmDialog
