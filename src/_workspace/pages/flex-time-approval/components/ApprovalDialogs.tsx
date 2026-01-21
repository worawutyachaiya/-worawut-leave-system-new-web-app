import { forwardRef, ReactElement, Ref, useEffect, useRef } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { SlideProps } from '@mui/material'
import { Slide } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CustomTextField from '@/components/mui/TextField'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import { useTranslation } from '@/contexts/TranslationContext'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
const rejectRemarkSchema = z.object({
  remark: z.string().optional()
})
type RejectRemarkFormData = z.infer<typeof rejectRemarkSchema>
interface ApproveConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  selectedCount: number
}
export const ApproveConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  selectedCount
}: ApproveConfirmDialogProps) => {
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
            Confirm Approval
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            คุณต้องการอนุมัติคำขอ Flex Time {selectedCount} รายการ ใช่หรือไม่ ?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <LoadingButton
              onClick={onConfirm}
              loading={isLoading}
              loadingIndicator='Approving...'
              variant='contained'
              color='success'
              sx={{ minWidth: 120 }}
            >
              <span>{t('Yes, Approve')}</span>
            </LoadingButton>
            <Button variant='outlined' color='secondary' onClick={onClose} disabled={isLoading} sx={{ minWidth: 120 }}>
              {t('Cancel')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
interface RejectRemarkDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (remark: string) => void
  isLoading?: boolean
  selectedCount: number
}
export const RejectRemarkDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  selectedCount
}: RejectRemarkDialogProps) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const { control, handleSubmit, reset } = useForm<RejectRemarkFormData>({
    resolver: zodResolver(rejectRemarkSchema),
    defaultValues: {
      remark: ''
    }
  })
  const { errors } = useFormState({ control })
  const onSubmit = (data: RejectRemarkFormData) => {
    onConfirm(data.remark || '')
  }
  const handleClose = () => {
    reset({ remark: '' })
    onClose()
  }
  useEffect(() => {
    if (open) {
      reset({ remark: '' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, reset])
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
      <DialogContent sx={{ py: 4, px: 5 }}>
        <Box sx={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 4 }}>
            <CancelOutlined sx={{ fontSize: 100, color: 'error.main' }} />
          </Box>
          <Typography variant='h4' fontWeight='bold'>
            Reject Flex Time Request
          </Typography>
          <Typography variant='h6' sx={{ color: 'text.secondary', mb: 4 }}>
            คุณต้องการปฏิเสธคำขอ Flex Time {selectedCount} รายการ ใช่หรือไม่ ?
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Controller
              name='remark'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  inputRef={inputRef}
                  fullWidth
                  label={t('Remark')}
                  placeholder={t('Enter remark (optional)')}
                  multiline
                  rows={3}
                  error={!!errors.remark}
                  helperText={errors.remark?.message}
                  sx={{ mb: 4 }}
                />
              )}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <LoadingButton
                type='submit'
                loading={isLoading}
                loadingIndicator={t('Rejecting...')}
                variant='contained'
                color='error'
                sx={{ minWidth: 120 }}
              >
                <span>{t('Yes, Reject')}</span>
              </LoadingButton>
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
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
