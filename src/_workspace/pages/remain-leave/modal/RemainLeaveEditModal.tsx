import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  Slide
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'
import CustomTextField from '@/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import ConfirmModal from './ConfirmModal'
import { RemainLeaveInterface } from '@/_workspace/types/remain-leave/RemainLeaveInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import type { SlideProps } from '@mui/material'
import { useTranslation } from '@/contexts/TranslationContext'

const editRemainLeaveSchema = z.object({
  remainLeave: z.string().min(1, 'Remain Leave is required')
})

type EditRemainLeaveFormData = z.infer<typeof editRemainLeaveSchema>

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

interface RemainLeaveEditModalProps {
  open: boolean
  onClose: () => void
  selectedData: RemainLeaveInterface | null
  onSave: (data: any) => void
  isLoading?: boolean
}

const RemainLeaveEditModal = ({
  open,
  onClose,
  selectedData,
  onSave,
  isLoading = false
}: RemainLeaveEditModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditRemainLeaveFormData>({
    resolver: zodResolver(editRemainLeaveSchema),
    defaultValues: {
      remainLeave: ''
    }
  })

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<any>(null)

  useEffect(() => {
    if (open && selectedData) {
      reset({
        remainLeave: String(selectedData.LEAVE_REMAIN_DAY || '0')
      })
    }
  }, [open, selectedData, reset])

  const handleSave = handleSubmit((data: EditRemainLeaveFormData) => {
    const payload = {
      EMPLOYEE_CODE: selectedData?.EMPLOYEE_CODE,
      LEAVE_TYPE_ID: selectedData?.LEAVE_TYPE_ID,
      LEAVE_REMAIN_DAY: Number(data.remainLeave),
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE || ''
    }
    setPendingPayload(payload)
    setShowConfirmModal(true)
  })

  const handleConfirm = () => {
    if (pendingPayload) {
      onSave(pendingPayload)
      setShowConfirmModal(false)
      setPendingPayload(null)
    }
  }

  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setPendingPayload(null)
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const { t } = useTranslation()
  if (!selectedData) return null

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='xs'
        fullWidth
        TransitionComponent={Transition}
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle>
          <Typography variant='h5' component='span'>
            {t('Edit Remain Leave')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label={t('Employee Code')}
                value={selectedData.EMPLOYEE_CODE || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label={t('Employee Name')}
                value={`${selectedData.EMPLOYEE_NAME || ''} ${selectedData.EMPLOYEE_SURNAME || ''}`.trim()}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label={t('Section')}
                value={selectedData.EMPLOYEE_SECTION || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label={t('Start Work')}
                value={
                  selectedData.EMPLOYEE_START_WORK ? dayjs(selectedData.EMPLOYEE_START_WORK).format('DD-MMM-YYYY') : ''
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label={t('Leave Type')}
                value={selectedData.LEAVE_TYPE_CODE || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            <Grid item xs={12}>
              <Controller
                name='remainLeave'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label={t('Remain Leave')}
                    placeholder={t('Enter remain leave days')}
                    error={!!errors.remainLeave}
                    helperText={errors.remainLeave?.message}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0, step: 0.5 }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSave} variant='contained' color='primary' disabled={isLoading}>
            {t('Save')}
          </Button>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isLoading}>
            {t('Cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  )
}

export default RemainLeaveEditModal
