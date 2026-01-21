import { Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Controller, useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import CustomTextField from '@/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { useGetFlexTimeTypes, useCreateFlexTime, PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useFlexTime'
import { useLeaveHolidayCompany } from '@/_workspace/react-query/hooks/useLeaveHolidayCompany'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { validationSchemaPage, FormDataPage, FlexTimeTypeOption } from '../validationSchema'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import FlexTimeRequestConfirmModal from './FlexTimeRequestConfirmModal'
import { useTranslation } from '@/contexts/TranslationContext'
interface Props {
  open: boolean
  onClose: () => void
  selectedDate: string
}
const FlexTimeRequestFormDialog = ({ open, onClose, selectedDate }: Props) => {
  const { t } = useTranslation()
  const methods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: {
      formData: {
        flexTimeType: null as any,
        startDate: selectedDate,
        endDate: selectedDate,
        reason: ''
      }
    }
  })
  const { control, handleSubmit, reset, watch, setValue } = methods
  const queryClient = useQueryClient()
  const watchStartDate = watch('formData.startDate')
  useEffect(() => {
    if (open && selectedDate) {
      reset({
        formData: {
          flexTimeType: null as any,
          startDate: selectedDate,
          endDate: selectedDate,
          reason: ''
        }
      })
    }
  }, [open, selectedDate, reset])
  const { data: flexTimeTypesData } = useGetFlexTimeTypes()
  const flexTimeTypes: FlexTimeTypeOption[] =
    (flexTimeTypesData?.data?.ResultOnDb as unknown as FlexTimeTypeOption[]) || []
  const { data: holidayCompanyData } = useLeaveHolidayCompany({}, true)
  const companyHolidays: Date[] =
    holidayCompanyData?.data?.ResultOnDb?.map(holiday => new Date(holiday.day_holiday)) || []
  const [confirmModal, setConfirmModal] = useState(false)
  const { mutateAsync: createFlexTime, isPending: isCreating } = useCreateFlexTime()
  const onSubmit = () => {
    setConfirmModal(true)
  }
  const handleConfirmSubmit = async () => {
    const formData = methods.getValues('formData')
    const userData = getUserData()
    try {
      const response = await createFlexTime({
        EMPLOYEE_CODE: userData?.EMPLOYEE_CODE || '',
        FLEX_TIME_ID: formData.flexTimeType?.FLEX_TIME_TYPE_ID || 0,
        START_DATE: formData.startDate,
        END_DATE: formData.endDate,
        REASON: formData.reason || ''
      })
      if (response.data?.Status) {
        toast.success(response.data?.Message || 'Flex Time request created successfully')
        await queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_CALENDAR`] })
        setConfirmModal(false)
        handleClose()
      } else {
        toast.error(response.data?.Message || 'Failed to create Flex Time request')
        setConfirmModal(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create Flex Time request')
      setConfirmModal(false)
    }
  }
  const handleClose = () => {
    if (!isCreating) {
      onClose()
    }
  }
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' }
        }}
      >
        <DialogTitle>
          <Typography variant='h5' component='span'>
            {t('Flex Time Request')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple disabled={isCreating}>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <FormProvider {...methods}>
            <Grid container spacing={4} sx={{ mt: 1 }}>
              {/* Flex Time Type */}
              <Grid item xs={12}>
                <Controller
                  name='formData.flexTimeType'
                  control={control}
                  render={({ field }) => (
                    <AsyncSelectCustom
                      {...field}
                      label={t('Time')}
                      defaultOptions={flexTimeTypes}
                      loadOptions={() => Promise.resolve(flexTimeTypes)}
                      getOptionLabel={option => option.FLEX_TIME_DESCRIPTION}
                      getOptionValue={option => option.FLEX_TIME_TYPE_ID?.toString()}
                      placeholder={t('Select flex time type')}
                      isClearable
                      error={!!methods.formState.errors.formData?.flexTimeType}
                      helperText={t(methods.formState.errors.formData?.flexTimeType?.message || '')}
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>
              {/* Start Date - DatePicker with Holiday Exclude */}
              <Grid item xs={6}>
                <Controller
                  name='formData.startDate'
                  control={control}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <AppReactDatepicker
                      selected={value ? new Date(value) : null}
                      onChange={(date: Date | null) => {
                        onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)
                        setValue('formData.endDate', date ? dayjs(date).format('YYYY-MM-DD') : '')
                      }}
                      placeholderText={t('Select Date')}
                      minDate={new Date()}
                      excludeDates={companyHolidays}
                      highlightDates={companyHolidays}
                      autoComplete='off'
                      customInput={
                        <CustomTextField
                          label={t('Start Date')}
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      }
                    />
                  )}
                />
              </Grid>
              {/* End Date - DatePicker with Holiday Exclude */}
              <Grid item xs={6}>
                <Controller
                  name='formData.endDate'
                  control={control}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <AppReactDatepicker
                      selected={value ? new Date(value) : null}
                      onChange={(date: Date | null) => {
                        onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)
                      }}
                      placeholderText={t('Select Date')}
                      minDate={watchStartDate ? new Date(watchStartDate) : new Date()}
                      excludeDates={companyHolidays}
                      highlightDates={companyHolidays}
                      autoComplete='off'
                      customInput={
                        <CustomTextField label={t('End Date')} fullWidth error={!!error} helperText={error?.message} />
                      }
                    />
                  )}
                />
              </Grid>
              {/* Reason */}
              <Grid item xs={12}>
                <Controller
                  name='formData.reason'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label={t('Description (Optional)')}
                      placeholder={t('Enter description')}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isCreating}>
            {t('Cancel')}
          </Button>
          <Button variant='contained' color='primary' disabled={isCreating} onClick={handleSubmit(onSubmit)}>
            {t('Submit')}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Modal */}
      <FlexTimeRequestConfirmModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isCreating}
      />
    </>
  )
}
export default FlexTimeRequestFormDialog
