// React Imports
import { useEffect, useState } from 'react'

// Confirm Modal
import ConfirmModal from './ConfirmModal'
import { toast } from 'react-toastify'
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
  Box,
  FormHelperText,
  CircularProgress
} from '@mui/material'

// MUI Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

// React Hook Form Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// React Query
import { useQueryClient } from '@tanstack/react-query'
import { useCreateDocument, PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrDocument'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Fetch function
import { fetchLeaveTypeAll } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveTypeAll'

// Types & Validation Imports
import { validationSchemaModal, FormDataModal, DocumentData } from './validationSchema'

interface Props {
  open: boolean
  onClose: () => void
  onSubmitSuccess?: () => void
}

function AddDocumentModal({ open, onClose, onSubmitSuccess }: Props) {
  const { t } = useTranslation()
  const [fileName, setFileName] = useState<string>('No file chosen')
  const queryClient = useQueryClient()

  // React Query Mutation
  const { mutateAsync: createDocument, isPending: isCreating } = useCreateDocument(
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
      console.error('Create document error:', error)
      toast.error('Failed to create. Please try again.')
    }
  )

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormDataModal>({
    resolver: zodResolver(validationSchemaModal),
    defaultValues: {
      LEAVE_TYPE: null,
      DESCRIPTION: '',
      FILE: null
    }
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        LEAVE_TYPE: null,
        DESCRIPTION: '',
        FILE: null
      })
      setFileName('No file chosen')
    }
  }, [open, reset])

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setValue('FILE', file)
      setFileName(file.name)
    }
  }

  const handleSave = async (formData: FormDataModal) => {
    try {
      const userData = getUserData()
      const formDataToSend = new FormData()

      // Append form fields
      formDataToSend.append('LEAVE_REGULARITY_NAME', formData.LEAVE_TYPE?.LEAVE_TYPE_DESCRIPTION_TH || '')
      formDataToSend.append('LEAVE_TYPE_ID', formData.LEAVE_TYPE?.LEAVE_TYPE_ID?.toString() || '')
      formDataToSend.append('DESCRIPTION', formData.DESCRIPTION || '')
      formDataToSend.append('CREATE_BY', `${userData?.EMPLOYEE_CODE}` || '')

      // Append file if exists
      if (formData.FILE) {
        formDataToSend.append('FILE_UPLOAD', formData.FILE)
      }

      // Store data and show confirm modal
      setPendingFormData(formDataToSend)
      setShowConfirmModal(true)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  // When user confirms in confirm modal
  const handleConfirm = async () => {
    if (pendingFormData) {
      await createDocument(pendingFormData)
      setShowConfirmModal(false)
      setPendingFormData(null)
    }
  }

  // When user cancels in confirm modal
  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setPendingFormData(null)
  }

  const isPending = isCreating

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
            {t('Add Leave Regularity')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple disabled={isPending}>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            {/*----------- Leave Type Dropdown -----------*/}
            <Grid item xs={12}>
              <Controller
                name='LEAVE_TYPE'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <AsyncSelectCustom
                      {...field}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix={'select'}
                      loadOptions={async () => {
                        const result = await fetchLeaveTypeAll()
                        return result as any
                      }}
                      getOptionValue={(data: any) => data?.LEAVE_TYPE_ID?.toString() || ''}
                      getOptionLabel={(data: any) =>
                        `${data?.LEAVE_TYPE_DESCRIPTION_TH} / ${data?.LEAVE_TYPE_DESCRIPTION_EN}`
                      }
                      label={t('Leave Type')}
                      placeholder={t('Select leave type')}
                      error={!!error}
                      helperText={error?.message}
                    />
                  </>
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

            {/*----------- File Upload -----------*/}
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                {t('Edit Leave Regularity')} (.pdf)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
                  {t('Choose File')}
                  <input type='file' hidden accept='.pdf' onChange={handleFileChange} />
                </Button>
                <Typography variant='body2' color='text.secondary'>
                  {fileName}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isPending}>
            {t('Cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleSubmit(handleSave)}
            variant='contained'
            color='primary'
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {isPending ? t('Creating...') : t('Create')}
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

export default AddDocumentModal
