// React Imports
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

// MUI Imports
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography } from '@mui/material'

// React Hook Form
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/th'

// Components
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@/components/mui/TextField'
import ConfirmPassProModal from './ConfirmPassProModal'

// Types
import { UserProbationInterface, SetPassProParams } from '@/_workspace/types/hr-user-probation/HrUserProbation'

// React Query Hooks
import { useSetPassPro } from '@/_workspace/react-query/hooks/useHrSearchProbation'

import { useTranslation } from '@/contexts/TranslationContext'

// Validation Schema
const editPassProSchema = z.object({
  passProDate: z.any().refine(val => val !== null && val !== undefined && val !== '', {
    message: 'Pass Pro Date is required'
  })
})

type EditPassProFormData = z.infer<typeof editPassProSchema>

interface EditPassProModalProps {
  open: boolean
  onClose: () => void
  selectedEmployee: UserProbationInterface | null
  onSave?: (data: any) => void
}

const EditPassProModal = ({ open, onClose, selectedEmployee, onSave }: EditPassProModalProps) => {
  const { t, locale } = useTranslation()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<SetPassProParams | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditPassProFormData>({
    resolver: zodResolver(editPassProSchema),
    defaultValues: {
      passProDate: null
    }
  })

  // Set Pass Pro Mutation
  const { mutate: setPassPro, isPending } = useSetPassPro(
    data => {
      // Success callback
      console.log('Set Pass Pro Success:', data)
      toast.success('Pass Pro updated successfully')
      onSave?.(data)
      setShowConfirmModal(false)
      handleClose()
    },
    error => {
      // Error callback
      console.error('Set Pass Pro Error:', error)
      toast.error('Failed to update Pass Pro')
      setShowConfirmModal(false)
    }
  )

  // Reset form when modal opens
  useEffect(() => {
    if (open && selectedEmployee) {
      reset({
        passProDate: selectedEmployee.PASS_PRD_DATE ? dayjs(selectedEmployee.PASS_PRD_DATE) : null
      })
    }
  }, [open, selectedEmployee, reset])

  const handleClose = () => {
    reset()
    setPendingPayload(null)
    onClose()
  }

  // When Save button is clicked - show confirm modal
  const onSubmit = (data: EditPassProFormData) => {
    if (!selectedEmployee) return

    const formattedDate = data.passProDate ? dayjs(data.passProDate).format('YYYY-MM-DD') : null

    const payload: SetPassProParams = {
      EMPLOYEE_CODE: selectedEmployee.EMPLOYEE_CODE,
      UPDATE_DATE: formattedDate || '',
      UPDATE_BY: 'HR_ADMIN' // TODO: Get from logged in user
    }

    // Store payload and show confirm modal
    setPendingPayload(payload)
    setShowConfirmModal(true)
  }

  // When user confirms in confirm modal
  const handleConfirm = () => {
    if (pendingPayload) {
      setPassPro(pendingPayload)
    }
  }

  // When user cancels in confirm modal
  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setPendingPayload(null)
  }

  if (!selectedEmployee) return null

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
            {t('Edit Pass Pro')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Employee Code - Read Only */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label={t('Employee Code')}
                value={selectedEmployee.EMPLOYEE_CODE || ''}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            {/* Employee Name and Surname - Read Only */}
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                label={t('Employee Name')}
                value={selectedEmployee.EMPLOYEE_NAME || ''}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                label={t('Surname')}
                value={selectedEmployee.EMPLOYEE_SURNAME || ''}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            {/* Start Work Date - Read Only */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label={t('Start Work')}
                value={dayjs(selectedEmployee.EMPLOYEE_START_WORK).format('DD MMM YYYY')}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            {/* Pass Pro Date - Editable Date Picker */}
            <Grid item xs={12}>
              <Controller
                name='passProDate'
                control={control}
                render={({ field }) => (
                  <AppReactDatepicker
                    {...field}
                    selected={field.value ? (field.value as Dayjs).toDate() : null}
                    onChange={(date: Date | null) => field.onChange(date ? dayjs(date) : null)}
                    placeholderText={t('Choose a date')}
                    customInput={
                      <CustomTextField
                        fullWidth
                        label={t('Pass Pro Date')}
                        error={!!errors.passProDate}
                        helperText={t((errors.passProDate?.message as string) || '')}
                      />
                    }
                    dateFormat={dayjs().format('DD MMM YYYY')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant='outlined' color='secondary'>
            {t('Cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} variant='contained' color='primary'>
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Modal */}
      <ConfirmPassProModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        isLoading={isPending}
      />
    </>
  )
}

export default EditPassProModal
