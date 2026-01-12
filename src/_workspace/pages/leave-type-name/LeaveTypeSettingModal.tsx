import { useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  CircularProgress
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomTextField from '@/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { useQueryClient } from '@tanstack/react-query'
import {
  useCreateLeaveType,
  useUpdateLeaveType,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useLeaveTypeSetting'
import { validationSchemaModal, FormDataModal } from './validationSchema'
import type { LeaveTypeData } from '@/_workspace/types/leave-type-setting/LeaveTypeSettingInterface'
interface Props {
  open: boolean
  onClose: () => void
  data: LeaveTypeData | null
  isEditMode: boolean
}
function LeaveTypeSettingModal({ open, onClose, data, isEditMode }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormDataModal>({
    resolver: zodResolver(validationSchemaModal),
    defaultValues: {
      LEAVE_TYPE_CODE: '',
      LEAVE_TYPE_DESCRIPTION_TH: '',
      LEAVE_TYPE_DESCRIPTION_EN: '',
      LEAVE_TYPE_MAX_DAY: 0,
      LEAVE_TYPE_IS_REQUIRE_FILE: false,
      LEAVE_TYPE_IS_ACTIVE: true,
      LEAVE_TYPE_SORT_ORDER: 0
    }
  })
  const { mutateAsync: createLeaveType, isPending: isCreating } = useCreateLeaveType()
  const { mutateAsync: updateLeaveType, isPending: isUpdating } = useUpdateLeaveType()
  useEffect(() => {
    if (open && data && isEditMode) {
      reset({
        LEAVE_TYPE_CODE: data.LEAVE_TYPE_CODE,
        LEAVE_TYPE_DESCRIPTION_TH: data.LEAVE_TYPE_DESCRIPTION_TH,
        LEAVE_TYPE_DESCRIPTION_EN: data.LEAVE_TYPE_DESCRIPTION_EN,
        LEAVE_TYPE_MAX_DAY: data.LEAVE_TYPE_MAX_DAY,
        LEAVE_TYPE_IS_REQUIRE_FILE: data.LEAVE_TYPE_IS_REQUIRE_FILE,
        LEAVE_TYPE_IS_ACTIVE: data.LEAVE_TYPE_IS_ACTIVE,
        LEAVE_TYPE_SORT_ORDER: data.LEAVE_TYPE_SORT_ORDER || 0
      })
    } else if (open && !isEditMode) {
      reset({
        LEAVE_TYPE_CODE: '',
        LEAVE_TYPE_DESCRIPTION_TH: '',
        LEAVE_TYPE_DESCRIPTION_EN: '',
        LEAVE_TYPE_MAX_DAY: 0,
        LEAVE_TYPE_IS_REQUIRE_FILE: false,
        LEAVE_TYPE_IS_ACTIVE: true,
        LEAVE_TYPE_SORT_ORDER: 0
      })
    }
  }, [open, data, isEditMode, reset])
  const onSubmit = async (formData: FormDataModal) => {
    try {
      if (isEditMode && data) {
        await updateLeaveType({
          ...formData,
          LEAVE_TYPE_ID: data.LEAVE_TYPE_ID
        })
      } else {
        await createLeaveType(formData)
      }
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      onClose()
    } catch (error) {
      console.error('Submit error:', error)
    }
  }
  const isLoading = isCreating || isUpdating
  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && !isLoading) {
          handleClose()
        }
      }}
      maxWidth='md'
      fullWidth
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' }
      }}
    >
      <DialogTitle>
        <Typography variant='h5' component='span'>
          {isEditMode ? t('Edit Leave Type') : t('Add New Leave Type')}
        </Typography>
        <DialogCloseButton onClick={handleClose} disableRipple disabled={isLoading}>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          {/* Leave Type Code */}
          <Grid item xs={12} md={4}>
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
          {/* Description TH */}
          <Grid item xs={12} md={4}>
            <Controller
              name='LEAVE_TYPE_DESCRIPTION_TH'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={t('Description (TH)')}
                  placeholder={t('Enter description in Thai')}
                  error={!!errors.LEAVE_TYPE_DESCRIPTION_TH}
                  helperText={errors.LEAVE_TYPE_DESCRIPTION_TH?.message}
                />
              )}
            />
          </Grid>
          {/* Description EN */}
          <Grid item xs={12} md={4}>
            <Controller
              name='LEAVE_TYPE_DESCRIPTION_EN'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={t('Description (EN)')}
                  placeholder={t('Enter description in English')}
                  error={!!errors.LEAVE_TYPE_DESCRIPTION_EN}
                  helperText={errors.LEAVE_TYPE_DESCRIPTION_EN?.message}
                />
              )}
            />
          </Grid>
          {/* Max Day */}
          <Grid item xs={12} md={4}>
            <Controller
              name='LEAVE_TYPE_MAX_DAY'
              control={control}
              render={({ field: { onChange, ...field } }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label={t('Max Day')}
                  placeholder={t('Enter max day')}
                  error={!!errors.LEAVE_TYPE_MAX_DAY}
                  helperText={errors.LEAVE_TYPE_MAX_DAY?.message}
                  onChange={e => onChange(Number(e.target.value))}
                />
              )}
            />
          </Grid>
          {/* Sort Order */}
          <Grid item xs={12} md={4}>
            <Controller
              name='LEAVE_TYPE_SORT_ORDER'
              control={control}
              render={({ field: { onChange, ...field } }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label={t('Sort Order')}
                  placeholder={t('Enter sort order')}
                  onChange={e => onChange(Number(e.target.value))}
                />
              )}
            />
          </Grid>
          {/* Switches */}
          <Grid item xs={12} md={4}>
            <Controller
              name='LEAVE_TYPE_IS_REQUIRE_FILE'
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormControlLabel
                  control={<Switch checked={value} onChange={e => onChange(e.target.checked)} />}
                  label={t('Require File Upload')}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name='LEAVE_TYPE_IS_ACTIVE'
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormControlLabel
                  control={<Switch checked={value} onChange={e => onChange(e.target.checked)} />}
                  label={t('Active')}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isLoading}>
          {t('Cancel')}
        </Button>
        <Button
          type='button'
          onClick={() => handleSubmit(onSubmit)()}
          variant='contained'
          color='primary'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
        >
          {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? t('Update') : t('Create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default LeaveTypeSettingModal
