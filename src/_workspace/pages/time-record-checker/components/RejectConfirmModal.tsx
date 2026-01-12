import { forwardRef, ReactElement, Ref } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import type { SlideProps } from '@mui/material'
import { Slide } from '@mui/material'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import { useTranslation } from '@/contexts/TranslationContext'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rejectFormSchema, RejectFormData } from './validationSchema'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface RejectConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading: boolean
  selectedCount: number
}

const RejectConfirmModal = ({ open, onClose, onConfirm, isLoading, selectedCount }: RejectConfirmModalProps) => {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      reason: ''
    }
  })

  const handleClose = () => {
    if (!isLoading) {
      reset()
      onClose()
    }
  }

  const onSubmit = (data: RejectFormData) => {
    onConfirm(data.reason)
  }

  return (
    <Dialog
      maxWidth='sm'
      fullWidth
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && !isLoading) {
          handleClose()
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ py: 4, px: 5 }}>
          <Box sx={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 4 }}>
              <CancelOutlined sx={{ fontSize: 80, color: 'error.main' }} />
            </Box>
            <Typography variant='h4' fontWeight='bold'>
              {t('Confirm Reject')}
            </Typography>
            <Typography variant='body1' sx={{ color: 'text.secondary', mb: 3 }}>
              {t('Are you sure you want to reject')} {selectedCount} {t('selected items?')}
            </Typography>
            <Controller
              name='reason'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label={t('Reason')}
                  placeholder={t('Please enter reason for rejection')}
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                type='submit'
                disabled={isLoading}
                variant='contained'
                color='error'
                sx={{ minWidth: 120 }}
                startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
              >
                {isLoading ? t('Rejecting...') : t('Yes, Reject')}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={handleClose}
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                {t('Cancel')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default RejectConfirmModal
