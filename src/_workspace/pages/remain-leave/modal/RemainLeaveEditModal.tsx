import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider
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

const editRemainLeaveSchema = z.object({
  remainLeave: z.string().min(1, 'Remain Leave is required')
})

type EditRemainLeaveFormData = z.infer<typeof editRemainLeaveSchema>

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

  if (!selectedData) return null

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle>
          <Typography variant='h5' component='span'>
            Edit Remain Leave
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
                label='Employee ID'
                value={selectedData.EMPLOYEE_CODE || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label='Employee Name'
                value={`${selectedData.EMPLOYEE_NAME || ''} ${selectedData.EMPLOYEE_SURNAME || ''}`.trim()}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label='Section'
                value={selectedData.EMPLOYEE_SECTION || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                disabled
                label='Start Work'
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
                label='Leave Type'
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
                    label='Remain Leave *'
                    placeholder='Enter remain leave days'
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
            Save
          </Button>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isLoading}>
            Cancel
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
