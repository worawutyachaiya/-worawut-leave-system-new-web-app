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
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchLeaveTypeAll } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveTypeAll'
import { fetchDepartmentAll } from '@/_workspace/react-select/async-promise-load-options/fetchDepartmentAll'

// Hooks Imports
import { useCreateLeaveTypeRegulation, PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrLeaveTypeRegulation'
import { useQueryClient } from '@tanstack/react-query'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Types & Validation Imports
import { z } from 'zod'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'

// Validation Schema for Add Modal
const validationSchemaAdd = z.object({
  LEAVE_TYPE: z
    .any()
    .nullable()
    .refine(val => val !== null && val?.LEAVE_TYPE_ID, { message: requiredFieldMessage({ fieldName: 'Leave Type' }) }),
  DEPARTMENT: z.string().min(1, requiredFieldMessage({ fieldName: 'Department' })),
  NUMBER_DAY: z.number().min(0, 'Number must be 0 or greater')
})

type FormDataAdd = z.infer<typeof validationSchemaAdd>

interface Props {
  open: boolean
  onClose: () => void
  onSubmitSuccess?: () => void
}

function LeaveTypeRegulationAddModal({ open, onClose, onSubmitSuccess }: Props) {
  // Translation helper
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Create Mutation
  const { mutateAsync: createRegulation, isPending: isCreating } = useCreateLeaveTypeRegulation(
    response => {
      if (response.data.Status) {
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        toast.success(response.data.Message || 'Created successfully')
        if (onSubmitSuccess) onSubmitSuccess()
        onClose()
      } else {
        toast.error(response.data.Message || 'Failed to create')
      }
    },
    error => {
      console.error('Create error:', error)
      toast.error('Failed to create. Please try again.')
    }
  )

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormDataAdd>({
    resolver: zodResolver(validationSchemaAdd),
    defaultValues: {
      LEAVE_TYPE: null,
      DEPARTMENT: '',
      NUMBER_DAY: 0
    }
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        LEAVE_TYPE: null,
        DEPARTMENT: '',
        NUMBER_DAY: 0
      })
    }
  }, [open, reset])

  const handleSave = handleSubmit(async (formData: FormDataAdd) => {
    const userData = getUserData()
    // Store data and show confirm modal
    setPendingFormData({
      LEAVE_TYPE_ID: Number(formData.LEAVE_TYPE?.LEAVE_TYPE_ID || formData.LEAVE_TYPE),
      DEPARTMENT: formData.DEPARTMENT,
      NUMBER_DAY: formData.NUMBER_DAY,
      CREATE_BY: userData?.EMPLOYEE_CODE || ''
    })
    setShowConfirmModal(true)
  })

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<any>(null)

  // When user confirms in confirm modal
  const handleConfirm = async () => {
    if (pendingFormData) {
      await createRegulation(pendingFormData)
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
    if (!isCreating) {
      onClose()
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && !isCreating) {
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
            {t('Add Leave Type Regulation')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple disabled={isCreating}>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={4}>
            {/*---------------------- Leave Type ----------------------*/}
            <Grid item xs={12}>
              <Controller
                name='LEAVE_TYPE'
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <AsyncSelectCustom
                    {...field}
                    label={t('Leave Type')}
                    placeholder={t('Select leave type')}
                    loadOptions={fetchLeaveTypeAll}
                    defaultOptions
                    classNamePrefix={'select'}
                    getOptionLabel={(option: any) =>
                      `${option.LEAVE_TYPE_DESCRIPTION_TH} / ${option.LEAVE_TYPE_DESCRIPTION_EN}`
                    }
                    getOptionValue={(option: any) => String(option.LEAVE_TYPE_ID)}
                    onChange={(option: any) => onChange(option || null)}
                    value={value}
                    error={!!errors.LEAVE_TYPE}
                    helperText={errors.LEAVE_TYPE?.message as any} // ปล่อยมันเถอะ
                  />
                )}
              />
            </Grid>

            {/*---------------------- Department ----------------------*/}
            <Grid item xs={12}>
              <Controller
                name='DEPARTMENT'
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <AsyncSelectCustom
                    {...field}
                    value={value ? { DEPARTMENT: value } : null}
                    onChange={(option: any) => onChange(option?.DEPARTMENT || '')}
                    label={t('Department')}
                    placeholder={t('Select department')}
                    loadOptions={fetchDepartmentAll}
                    defaultOptions
                    classNamePrefix={'select'}
                    getOptionLabel={(option: any) => option.DEPARTMENT}
                    getOptionValue={(option: any) => option.DEPARTMENT}
                    error={!!errors.DEPARTMENT}
                    helperText={errors.DEPARTMENT?.message}
                    styles={{
                      menuPortal: base => ({ ...base, zIndex: 9999 })
                    }}
                  />
                )}
              />
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isCreating}>
            {t('Cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            variant='contained'
            color='success'
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {isCreating ? 'Creating...' : t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Modal */}
      <ConfirmModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        isLoading={isCreating}
      />
    </>
  )
}

export default LeaveTypeRegulationAddModal
