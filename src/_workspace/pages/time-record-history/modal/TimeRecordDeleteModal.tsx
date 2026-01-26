import { forwardRef, ReactElement, Ref } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { SlideProps } from '@mui/material'
import { Slide, CircularProgress } from '@mui/material'
import type { MRT_Row } from 'material-react-table'
import { TimeRecordHistoryInterface } from '@/_workspace/types/time-record/TimeRecordInterface'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDeleteTimeRecord } from '@/_workspace/react-query/hooks/useTimeRecordHistorySearch'
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
  rowData: MRT_Row<TimeRecordHistoryInterface> | null
  onSuccess?: () => void
}
const TimeRecordCancelModal = ({ open, onClose, rowData, onSuccess }: LeaveCancelModalProps) => {
  const data = rowData?.original
  const { t } = useTranslation()
  const onDeleteSuccess = (response: any) => {
    if (response?.data?.Status === true) {
      ToastMessageSuccess({
        title: 'Cancel Leave Request',
        message: t(response?.data?.Message) || 'ยกเลิกการลาสำเร็จ'
      })
      onSuccess?.()
      onClose()
    } else {
      ToastMessageError({
        title: 'Cancel Leave Request',
        message: t(response?.data?.Message) || 'เกิดข้อผิดพลาดในการยกเลิกการลา'
      })
    }
  }

  const onDeleteError = (error: Error) => {
    ToastMessageError({
      title: 'Cancel Leave Request',
      message: t(error?.message) || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
    })
  }

  const { mutateAsync: deleteLeave, isPending: isLoading } = useDeleteTimeRecord(onDeleteSuccess, onDeleteError)
  const handleConfirmDelete = () => {
    if (!data) return
    const deleteParams = {
      TIME_RECORD_REQUEST_ID: data.TIME_RECORD_REQUEST_ID || '',
      EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || ''
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
            ยืนยันการยกเลิกคำขอเวลางานหรือไม่ ?
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
export default TimeRecordCancelModal
