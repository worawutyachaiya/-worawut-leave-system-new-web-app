import { forwardRef, ReactElement, Ref } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import type { SlideProps } from '@mui/material'
import { Slide, TextField } from '@mui/material'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { useTranslation } from '@/contexts/TranslationContext'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const rejectSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
})

type RejectFormData = z.infer<typeof rejectSchema>

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
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema)
  })

  const onSubmit = (data: RejectFormData) => {
    onConfirm(data.reason)
    reset()
  }

  const handleClose = () => {
    if (!isLoading) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog
      maxWidth='xs'
      fullWidth
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
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
            <Box sx={{ mb: 6 }}>
              <CancelOutlinedIcon sx={{ fontSize: 100, color: 'error.main' }} />
            </Box>
            <Typography variant='h4' fontWeight='bold' color='error'>
              {t('Reject Request')}
            </Typography>
            <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
              {t('Are you sure you want to reject')} {selectedCount} {t('selected items?')}
            </Typography>

            <TextField
              {...register('reason')}
              fullWidth
              multiline
              rows={3}
              label={t('Reason')}
              placeholder={t('Please enter reason for rejection')}
              error={!!errors.reason}
              helperText={errors.reason?.message ? t(errors.reason.message) : ''}
              disabled={isLoading}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
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
