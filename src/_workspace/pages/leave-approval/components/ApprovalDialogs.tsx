import { forwardRef, ReactElement, Ref } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { SlideProps } from '@mui/material'
import { Slide, CircularProgress } from '@mui/material'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomTextField from '@/components/mui/TextField'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import { rejectRemarkSchema, type RejectRemarkFormData } from './validationSchema'
import { useTranslation } from '@/contexts/TranslationContext'
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
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
          {/* Icon */}
          <Box sx={{ mb: 6 }}>
            <CheckCircleOutlined sx={{ fontSize: 100, color: 'success.main' }} />
          </Box>
          {/* Title */}
          <Typography variant='h4' fontWeight='bold'>
            Confirm Approval
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            คุณต้องการอนุมัติคำขอลา {selectedCount} รายการ ใช่หรือไม่ ?
          </Typography>
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              type='button'
              onClick={onConfirm}
              variant='contained'
              color='success'
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? t('Approving...') : t('Yes, Approve')}
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
  const { control, handleSubmit, reset, getValues } = useForm<RejectRemarkFormData>({
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
          {/* Icon */}
          <Box sx={{ mb: 6 }}>
            <CancelOutlined sx={{ fontSize: 100, color: 'error.main' }} />
          </Box>
          {/* Title */}
          <Typography variant='h4' fontWeight='bold'>
            Reject Leave Request
          </Typography>
          <Typography variant='h5' sx={{ color: 'text.secondary', mb: 4 }}>
            คุณต้องการปฏิเสธคำขอลา {selectedCount} รายการ ใช่หรือไม่ ?
          </Typography>
          {/* Remark TextField with Controller */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Controller
              name='remark'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Remark (เหตุผลการปฏิเสธ)'
                  placeholder='กรุณาระบุเหตุผลการปฏิเสธ (ถ้ามี)'
                  multiline
                  rows={3}
                  error={!!errors.remark}
                  helperText={errors.remark?.message}
                />
              )}
            />
          </Box>
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              type='button'
              onClick={() => handleSubmit(onSubmit)()}
              variant='contained'
              color='error'
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ minWidth: 120 }}
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
    </Dialog>
  )
}
