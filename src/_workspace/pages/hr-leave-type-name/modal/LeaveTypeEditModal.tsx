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
  MenuItem,
  CircularProgress
} from '@mui/material'

// React Hook Form Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// Hooks Imports
import { useUpdateLeaveType, PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrLeaveTypeName'
import { useQueryClient } from '@tanstack/react-query'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Types & Validation Imports
import { validationSchemaModal, FormDataModal, LeaveTypeData, statusOptions } from './validationSchema'

interface Props {
  open: boolean
  onClose: () => void
  data: LeaveTypeData | null
  isEditMode: boolean
  onSubmitSuccess?: () => void
}

function LeaveTypeEditModal({ open, onClose, data, isEditMode, onSubmitSuccess }: Props) {
  // Translation helper
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Mutations
  const { mutateAsync: updateLeaveType, isPending: isUpdating } = useUpdateLeaveType(
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
  } = useForm<FormDataModal>({
    resolver: zodResolver(validationSchemaModal),
    defaultValues: {
      LEAVE_TYPE_CODE: '',
      LEAVE_TYPE_NAME: '',
      DESCRIPTION: '',
      LEAVE_DAY_AS_DESCRIPTION: 0,
      LEAVE_TYPE_REQUEST_BEFORE_USE: 0,
      STATUS: 'Use'
    }
  })

  // Set form values when editing
  useEffect(() => {
    if (open && data && isEditMode) {
      reset({
        LEAVE_TYPE_CODE: data.LEAVE_TYPE_CODE || '',
        LEAVE_TYPE_NAME: data.LEAVE_TYPE_DESCRIPTION_EN || '',
        DESCRIPTION: (data as any).DESCRIPTION || '',
        LEAVE_DAY_AS_DESCRIPTION: (data as any).LEAVE_DAY_AS_DESCRIPTION || 0,
        LEAVE_TYPE_REQUEST_BEFORE_USE: data.LEAVE_TYPE_REQUEST_DAY_BEFORE_USE || 0,
        STATUS: String(data.INUSE) === '1' ? 'Use' : 'Cancel'
      })
    }
  }, [open, data, isEditMode, reset])

  // Submit handler
  const handleSave = handleSubmit(async formData => {
    const userData = getUserData()
    const commonData = {
      LEAVE_TYPE_CODE: formData.LEAVE_TYPE_CODE,
      LEAVE_TYPE_DESCRIPTION_EN: formData.LEAVE_TYPE_NAME,
      DESCRIPTION: formData.DESCRIPTION,
      LEAVE_TYPE_MAX_DAY: formData.LEAVE_DAY_AS_DESCRIPTION || 0,
      LEAVE_TYPE_REQUEST_DAY_BEFORE_USE: formData.LEAVE_TYPE_REQUEST_BEFORE_USE || 0,
      INUSE: formData.STATUS === 'Use' ? '1' : '0',
      UPDATE_BY: userData?.EMPLOYEE_CODE || ''
    }

    if (isEditMode && data) {
      // Store data and show confirm modal
      setPendingFormData(commonData)
      setShowConfirmModal(true)
    }
  })

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<any>(null)

  // When user confirms in confirm modal
  const handleConfirm = async () => {
    if (pendingFormData && data) {
      await updateLeaveType({
        ...pendingFormData,
        LEAVE_TYPE_ID: data.LEAVE_TYPE_ID || 0
      })
      setShowConfirmModal(false)
      setPendingFormData(null)
    }
  }

  // When user cancels in confirm modal
  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setPendingFormData(null)
  }

  const isPending = isUpdating

  // Handle close
  const handleClose = () => {
    if (!isPending) {
      onClose()
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && !isPending) {
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
            {isEditMode ? t('Edit Leave Type') : t('Add New Leave Type')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple disabled={isPending}>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            {/*----------- Leave Type Code -----------*/}
            <Grid item xs={12}>
              <Controller
                name='LEAVE_TYPE_CODE'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Leave Type Code')}
                    placeholder={t('Enter leave type code')}
                    error={!!errors.LEAVE_TYPE_CODE}
                    helperText={errors.LEAVE_TYPE_CODE?.message}
                    disabled={isEditMode}
                  />
                )}
              />
            </Grid>

            {/*----------- Leave Type Name -----------*/}
            <Grid item xs={12}>
              <Controller
                name='LEAVE_TYPE_NAME'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Leave Type Name')}
                    placeholder={t('Enter leave type name')}
                    error={!!errors.LEAVE_TYPE_NAME}
                    helperText={errors.LEAVE_TYPE_NAME?.message}
                    disabled={true}
                  />
                )}
              />
            </Grid>

            {/*----------- Description -----------*/}
            <Grid item xs={12}>
              <Controller
                name='DESCRIPTION'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Description')}
                    placeholder={t('Enter description')}
                    error={!!errors.DESCRIPTION}
                    helperText={errors.DESCRIPTION?.message}
                  />
                )}
              />
            </Grid>

            {/*----------- Leave Day as description -----------*/}
            <Grid item xs={12}>
              <Controller
                name='LEAVE_DAY_AS_DESCRIPTION'
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label={t('Leave Day as description')}
                    placeholder={t('Enter leave days')}
                    error={!!errors.LEAVE_DAY_AS_DESCRIPTION}
                    helperText={errors.LEAVE_DAY_AS_DESCRIPTION?.message}
                    onChange={e => onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            {/*----------- Leave type request before use -----------*/}
            <Grid item xs={12}>
              <Controller
                name='LEAVE_TYPE_REQUEST_BEFORE_USE'
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label={t('Leave type request before use')}
                    placeholder={t('Enter days before use')}
                    error={!!errors.LEAVE_TYPE_REQUEST_BEFORE_USE}
                    helperText={errors.LEAVE_TYPE_REQUEST_BEFORE_USE?.message}
                    onChange={e => onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            {/*----------- Status -----------*/}
            <Grid item xs={12}>
              <Controller
                name='STATUS'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={t('Status')}
                    error={!!errors.STATUS}
                    helperText={errors.STATUS?.message}
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isPending}>
            {t('Cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            variant='contained'
            color='primary'
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {isPending ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? t('Save') : t('Create')}
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

export default LeaveTypeEditModal
