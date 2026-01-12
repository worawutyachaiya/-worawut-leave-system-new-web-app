// React Imports
import { useEffect, useState } from 'react'

// Confirm Modal
import ConfirmModal from './ConfirmModal'
import { toast } from 'react-toastify'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// MUI Imports
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  CircularProgress
} from '@mui/material'

// React Hook Form Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'
import { statusOptions } from '../validationSchema'

// Hooks Imports
import { useUpdateLeaveTypeRegulation, PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrLeaveTypeRegulation'
import { useQueryClient } from '@tanstack/react-query'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Types & Validation Imports
import { z } from 'zod'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import type { LeaveTypeRegulationData } from './validationSchema'

// Validation Schema for Edit Modal
const validationSchemaEdit = z.object({
  NUMBER_DAY: z.number().min(0, 'Number must be 0 or greater'),
  INUSE: z.string().min(1, requiredFieldMessage({ fieldName: 'Status' }))
})

type FormDataEdit = z.infer<typeof validationSchemaEdit>

interface Props {
  open: boolean
  onClose: () => void
  data: LeaveTypeRegulationData | null
  onSubmitSuccess?: () => void
}

function LeaveTypeRegulationEditModal({ open, onClose, data, onSubmitSuccess }: Props) {
  // Translation helper
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Update Mutation
  const { mutateAsync: updateRegulation, isPending: isUpdating } = useUpdateLeaveTypeRegulation(
    response => {
      if (response.data.Status) {
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        toast.success(response.data.Message || 'Saved successfully')
        if (onSubmitSuccess) onSubmitSuccess()
        onClose()
      } else {
        toast.error(response.data.Message || 'Failed to save')
      }
    },
    error => {
      console.error('Update error:', error)
      toast.error('Failed to save. Please try again.')
    }
  )

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormDataEdit>({
    resolver: zodResolver(validationSchemaEdit),
    defaultValues: {
      NUMBER_DAY: 0,
      INUSE: '1'
    }
  })

  // Set form values when editing
  useEffect(() => {
    if (open && data) {
      reset({
        NUMBER_DAY: data.LEAVE_TYPE_REQUEST_DAY_BEFORE_USE || 0,
        INUSE: String(data.INUSE || '1')
      })
    }
  }, [open, data, reset])

  const handleSave = handleSubmit(async (formData: FormDataEdit) => {
    const userData = getUserData()
    if (data) {
      // Store data and show confirm modal
      setPendingFormData({
        LEAVE_TYPE_REGULATION_ID: data.LEAVE_TYPE_REGULATION_ID || 0,
        NUMBER_DAY: formData.NUMBER_DAY,
        UPDATE_BY: userData?.EMPLOYEE_CODE || '',
        INUSE: formData.INUSE
      })
      setShowConfirmModal(true)
    }
  })

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<any>(null)

  // When user confirms in confirm modal
  const handleConfirm = async () => {
    if (pendingFormData) {
      await updateRegulation(pendingFormData)
      setShowConfirmModal(false)
      setPendingFormData(null)
    }
  }

  // When user cancels in confirm modal
  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setPendingFormData(null)
  }

  // Handle close
  const handleClose = () => {
    if (!isUpdating) {
      onClose()
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && !isUpdating) {
            handleClose()
          }
        }}
        maxWidth='sm'
        fullWidth
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' }
        }}
      >
        <DialogTitle>
          <Typography variant='h5' component='span'>
            {t('Edit Leave Type Regulation')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple disabled={isUpdating}>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={4}>
            {/*---------------------- Leave Type (Read-only) ----------------------*/}
            <Grid item xs={12}>
              <CustomTextField
                value={
                  data?.LEAVE_TYPE_DESCRIPTION_TH
                    ? `${data.LEAVE_TYPE_DESCRIPTION_TH} / ${data.LEAVE_TYPE_DESCRIPTION_EN}`
                    : data?.LEAVE_TYPE_DESCRIPTION_EN || ''
                }
                fullWidth
                label={t('Leave Type')}
                disabled
              />
            </Grid>

            {/*---------------------- Department (Read-only) ----------------------*/}
            <Grid item xs={12}>
              <CustomTextField value={data?.DEPARTMENT || ''} fullWidth label={t('Department')} disabled />
            </Grid>

            {/*---------------------- Number of Day before use ----------------------*/}
            <Grid item xs={12}>
              <Controller
                name='NUMBER_DAY'
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label={t('Number of Day before use')}
                    placeholder={t('Enter a number of day')}
                    error={!!errors.NUMBER_DAY}
                    helperText={errors.NUMBER_DAY?.message}
                    onChange={e => onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            {/*---------------------- Status ----------------------*/}
            <Grid item xs={12}>
              <Controller
                name='INUSE'
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <SelectCustom
                    {...field}
                    value={statusOptions.find(option => option.value === value) || null}
                    onChange={(option: any) => onChange(option ? option.value : '')}
                    label={t('Status')}
                    classNamePrefix={'select'}
                    options={statusOptions as any}
                    error={!!errors.INUSE}
                    helperText={errors.INUSE?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isUpdating}>
            {t('Cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            variant='contained'
            color='success'
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {isUpdating ? 'Saving...' : t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Modal */}
      <ConfirmModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        isLoading={isUpdating}
      />
    </>
  )
}

export default LeaveTypeRegulationEditModal
