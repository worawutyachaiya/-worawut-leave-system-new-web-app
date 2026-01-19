import { forwardRef, ReactElement, Ref } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { SlideProps } from '@mui/material'
import { Slide, CircularProgress } from '@mui/material'
import type { MRT_Row } from 'material-react-table'
import { LeaveHistoryInterface } from '@/_workspace/types/leave-history/LeaveHistoryInterface'
import { useDeleteLeave, PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useDeleteLeave'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '@/contexts/TranslationContext'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
interface LeaveCancelModalProps {
  open: boolean
  onClose: () => void
  rowData: MRT_Row<LeaveHistoryInterface> | null
  onSuccess?: () => void
}
const LeaveCancelModal = ({ open, onClose, rowData, onSuccess }: LeaveCancelModalProps) => {
  const { t } = useTranslation()
  const data = rowData?.original
  const queryClient = useQueryClient()
  const { mutateAsync: deleteLeave, isPending: isLoading } = useDeleteLeave(
    response => {
      if (response?.data?.Status === true) {
        ToastMessageSuccess({
          title: 'Cancel Leave Request',
          message: t('Cancel Leave Success')
        })
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        onSuccess?.()
        onClose()
      } else {
        ToastMessageError({
          title: 'Cancel Leave Request',
          message: t('Cancel Leave Failed')
        })
      }
    },
    error => {
      ToastMessageError({
        title: 'Cancel Leave Request',
        message: t('Error connecting to the server')
      })
    }
  )
  const handleConfirmDelete = () => {
    if (!data) return
    const deleteParams = {
      LEAVE_REQUEST_ID: data.LEAVE_REQUEST_ID || '',
      EMPLOYEE_CODE: data.EMPLOYEE_CODE || '',
      LEAVE_TYPE_ID: data.LEAVE_TYPE_ID || 0,
      LEAVE_REQUEST_TOTAL_DAY: data.LEAVE_REQUEST_TOTAL_DAY || 0,
      LEAVE_REQUEST_START_DATE: data.LEAVE_REQUEST_START_DATE || '',
      LEAVE_REQUEST_END_DATE: data.LEAVE_REQUEST_END_DATE || '',
      LEAVE_TYPE_DESCRIPTION_TH: data.LEAVE_TYPE_DESCRIPTION_TH || ''
    }
    deleteLeave(deleteParams)
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
          alignItems: 'flex-start'
        }
      }}
      PaperProps={{ sx: { top: 30, m: 0 } }}
    >
      <DialogContent sx={{ py: 4, px: 5 }}>
        <Box sx={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          {/* Confirm Image */}
          <Box
            component='img'
            src={undraw_clean_up_re_504g}
            alt='Cancel'
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
            ยืนยันการยกเลิกคำขอลาหรือไม่ ?
          </Typography>
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              type='button'
              onClick={handleConfirmDelete}
              variant='contained'
              color='error'
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? t('Cancelling...') : t('Yes, Cancel !')}
            </Button>
            <Button variant='outlined' color='secondary' onClick={onClose} disabled={isLoading} sx={{ minWidth: 120 }}>
              {t('No, Keep it')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
export default LeaveCancelModal
