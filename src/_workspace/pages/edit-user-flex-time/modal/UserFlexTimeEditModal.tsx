// React Imports
import { useEffect, useState, useMemo, useCallback } from 'react'

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
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress
} from '@mui/material'

// React Hook Form Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Hooks Imports
import {
  useUpdateUserFlexTime,
  useGetFlexTimeTypes,
  PREFIX_QUERY_KEY
} from '@/_workspace/react-query/hooks/useFlexTime'
import { useLeaveHolidayCompany } from '@/_workspace/react-query/hooks/useLeaveHolidayCompany'
import { useQueryClient } from '@tanstack/react-query'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Types
import type { UserFlexTimeData, FlexTimeType } from '@/_workspace/types/flex-time/FlexTimeInterface'

// Dayjs
import dayjs from 'dayjs'

// Validation Schema
const validationSchema = z.object({
  FLEX_TIME_TYPE_ID: z.number().min(1, 'Please select flex time type'),
  START_DATE: z.string().min(1, 'Please select start date'),
  END_DATE: z.string().min(1, 'Please select end date'),
  TOTAL_DAY: z.number().min(0, 'Total day must be at least 0'),
  DESCRIPTION: z.string().optional()
})

type FormData = z.infer<typeof validationSchema>

interface Props {
  open: boolean
  onClose: () => void
  data: UserFlexTimeData | null
  onSubmitSuccess?: () => void
}

function UserFlexTimeEditModal({ open, onClose, data, onSubmitSuccess }: Props) {
  // Translation helper
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // State for calculating
  const [isCalculating, setIsCalculating] = useState(false)

  // Get Flex Time Types from API (like old system: flex-time/getFlexTime)
  const { data: flexTimeTypesData, isLoading: isLoadingFlexTimeTypes } = useGetFlexTimeTypes(open)
  const flexTimeTypes: FlexTimeType[] = useMemo(() => {
    const result = flexTimeTypesData?.data?.ResultOnDb as unknown
    if (Array.isArray(result)) {
      return result as FlexTimeType[]
    }
    return []
  }, [flexTimeTypesData])

  const { data: holidaysData, isLoading: isLoadingHolidays } = useLeaveHolidayCompany({}, open)

  const companyHolidays: Date[] = useMemo(() => {
    const result = holidaysData?.data?.ResultOnDb
    if (Array.isArray(result)) {
      return result.map(h => new Date(h.day_holiday))
    }
    return []
  }, [holidaysData])

  const holidayStrings: string[] = useMemo(() => {
    const result = holidaysData?.data?.ResultOnDb
    if (Array.isArray(result)) {
      return result.map(h => dayjs(h.day_holiday).format('YYYY-MM-DD'))
    }
    return []
  }, [holidaysData])

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  const { mutateAsync: updateUserFlexTime, isPending: isUpdating } = useUpdateUserFlexTime(
    response => {
      if (response.data.Status) {
        queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_USER`] })
        toast.success(response.data.Message || t('Updated successfully'))
        if (onSubmitSuccess) onSubmitSuccess()
        onClose()
      } else {
        toast.error(response.data.Message || t('Failed to update'))
      }
    },
    error => {
      console.error('Update error:', error)
      toast.error(t('Failed to update. Please try again.'))
    }
  )

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      FLEX_TIME_TYPE_ID: 0,
      START_DATE: '',
      END_DATE: '',
      TOTAL_DAY: 1,
      DESCRIPTION: ''
    }
  })

  const watchStartDate = watch('START_DATE')
  const watchEndDate = watch('END_DATE')

  const countHolidaysBetweenDates = useCallback(
    (startDateStr: string, endDateStr: string): number => {
      if (!startDateStr || !endDateStr) return 0

      let count = 0
      let current = dayjs(startDateStr).startOf('day')
      const end = dayjs(endDateStr).startOf('day')

      while (current.isBefore(end) || current.isSame(end, 'day')) {
        const currentStr = current.format('YYYY-MM-DD')
        if (holidayStrings.includes(currentStr)) {
          count++
        }
        current = current.add(1, 'day')
      }
      return count
    },
    [holidayStrings]
  )

  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      setIsCalculating(true)
      const start = dayjs(watchStartDate)
      const end = dayjs(watchEndDate)
      if (start.isValid() && end.isValid()) {
        const totalDays = end.diff(start, 'day') + 1
        const holidayCount = countHolidaysBetweenDates(watchStartDate, watchEndDate)
        const workingDays = totalDays - holidayCount
        setValue('TOTAL_DAY', workingDays > 0 ? workingDays : 0)
      }
      setIsCalculating(false)
    }
  }, [watchStartDate, watchEndDate, countHolidaysBetweenDates, setValue])

  useEffect(() => {
    if (open && data) {
      reset({
        FLEX_TIME_TYPE_ID: data.FLEX_TIME_TYPE_ID || 0,
        START_DATE: data.FLEX_TIME_REQUEST_START_DATE
          ? dayjs(data.FLEX_TIME_REQUEST_START_DATE).format('YYYY-MM-DD')
          : '',
        END_DATE: data.FLEX_TIME_REQUEST_END_DATE ? dayjs(data.FLEX_TIME_REQUEST_END_DATE).format('YYYY-MM-DD') : '',
        TOTAL_DAY: data.FLEX_TIME_REQUEST_TOTAL_DAY || 1,
        DESCRIPTION: data.DESCRIPTION || ''
      })
    }
  }, [open, data, reset])

  const handleSave = handleSubmit(async formData => {
    setPendingFormData(formData)
    setShowConfirmModal(true)
  })

  const handleConfirm = async () => {
    if (pendingFormData && data) {
      const userData = getUserData()
      await updateUserFlexTime({
        FLEX_TIME_REQUEST_ID: data.FLEX_TIME_REQUEST_ID,
        FLEX_TIME_TYPE_ID: pendingFormData.FLEX_TIME_TYPE_ID,
        FLEX_TIME_REQUEST_START_DATE: pendingFormData.START_DATE,
        FLEX_TIME_REQUEST_END_DATE: pendingFormData.END_DATE,
        FLEX_TIME_REQUEST_TOTAL_DAY: pendingFormData.TOTAL_DAY,
        DESCRIPTION: pendingFormData.DESCRIPTION || '',
        UPDATE_BY: userData?.EMPLOYEE_CODE || ''
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

  // Compare and display changes
  const compareValue = (newVal: any, oldVal: any, formatFn?: (val: any) => string) => {
    const formattedNew = formatFn ? formatFn(newVal) : String(newVal || '')
    const formattedOld = formatFn ? formatFn(oldVal) : String(oldVal || '')

    if (formattedNew === formattedOld) {
      return <Typography variant='body2'>{formattedOld}</Typography>
    }

    return (
      <Box>
        <Typography variant='body2' sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
          {formattedOld}
        </Typography>
        <Typography variant='body2' sx={{ color: 'error.main', fontWeight: 'bold' }}>
          {formattedNew}
        </Typography>
      </Box>
    )
  }

  const getFlexTimeDescription = (typeId: number) => {
    const type = flexTimeTypes.find(t => t.FLEX_TIME_TYPE_ID === typeId)
    return type?.FLEX_TIME_DESCRIPTION || ''
  }

  const isInitialLoading = isLoadingFlexTimeTypes || isLoadingHolidays

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && !isPending) {
            handleClose()
          }
        }}
        maxWidth='lg'
        fullWidth
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' }
        }}
      >
        <DialogTitle>
          <Typography variant='h5' component='span'>
            {t('Edit User Flex Time')}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple disabled={isPending}>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {isInitialLoading ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight={300}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Left Column - Preview Changes */}
              <Grid item xs={12} md={6}>
                <Card variant='outlined'>
                  <CardHeader title={t('Flex Time Request Selected')} titleTypographyProps={{ variant: 'h6' }} />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('Employee Code')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant='body2'>{data?.FLEX_TIME_REQUEST_EMPLOYEE_CODE}</Typography>
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('Employee Name')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant='body2'>
                          {data?.EMPLOYEE_NAME} {data?.EMPLOYEE_SURNAME}
                        </Typography>
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('Section')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant='body2'>{data?.EMPLOYEE_SECTION}</Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('Start Date')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        {compareValue(watchStartDate, data?.FLEX_TIME_REQUEST_START_DATE, val =>
                          val ? dayjs(val).format('YYYY-MM-DD') : '-'
                        )}
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('End Date')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        {compareValue(watchEndDate, data?.FLEX_TIME_REQUEST_END_DATE, val =>
                          val ? dayjs(val).format('YYYY-MM-DD') : '-'
                        )}
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('Flex Time Type')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        {compareValue(watch('FLEX_TIME_TYPE_ID'), data?.FLEX_TIME_TYPE_ID, val =>
                          getFlexTimeDescription(val)
                        )}
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('Total Day')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        {isCalculating ? (
                          <Box display='flex' alignItems='center' gap={1}>
                            <CircularProgress size={16} />
                            <Typography variant='body2'>{t('Calculating...')}</Typography>
                          </Box>
                        ) : (
                          compareValue(watch('TOTAL_DAY'), data?.FLEX_TIME_REQUEST_TOTAL_DAY)
                        )}
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant='body2' fontWeight='bold'>
                          {t('Reason')}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        {compareValue(watch('DESCRIPTION'), data?.DESCRIPTION)}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Edit Form */}
              <Grid item xs={12} md={6}>
                <Card variant='outlined'>
                  <CardHeader title={t('Edit Form')} titleTypographyProps={{ variant: 'h6' }} />
                  <CardContent>
                    <Grid container spacing={3}>
                      {/*----------- Start Date -----------*/}
                      <Grid item xs={12}>
                        <Controller
                          name='START_DATE'
                          control={control}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <AppReactDatepicker
                              selected={value ? new Date(value) : null}
                              onChange={(date: Date | null) => {
                                const newDate = date ? dayjs(date).format('YYYY-MM-DD') : ''
                                onChange(newDate)
                                // Reset end date if start date is after end date
                                if (watchEndDate && newDate && dayjs(newDate).isAfter(dayjs(watchEndDate))) {
                                  setValue('END_DATE', newDate)
                                }
                              }}
                              placeholderText={t('Select Start Date')}
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

                      {/*----------- End Date -----------*/}
                      <Grid item xs={12}>
                        <Controller
                          name='END_DATE'
                          control={control}
                          render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <AppReactDatepicker
                              selected={value ? new Date(value) : null}
                              onChange={(date: Date | null) => {
                                onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                              }}
                              placeholderText={t('Select End Date')}
                              minDate={watchStartDate ? new Date(watchStartDate) : undefined}
                              excludeDates={companyHolidays}
                              highlightDates={companyHolidays}
                              autoComplete='off'
                              customInput={
                                <CustomTextField
                                  label={t('End Date')}
                                  fullWidth
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              }
                            />
                          )}
                        />
                      </Grid>

                      {/*----------- Flex Time Type -----------*/}
                      <Grid item xs={12}>
                        <Controller
                          name='FLEX_TIME_TYPE_ID'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              select
                              fullWidth
                              label={t('Flex Time Type')}
                              error={!!errors.FLEX_TIME_TYPE_ID}
                              helperText={errors.FLEX_TIME_TYPE_ID?.message}
                            >
                              {flexTimeTypes.map(option => (
                                <MenuItem key={option.FLEX_TIME_TYPE_ID} value={option.FLEX_TIME_TYPE_ID}>
                                  {option.FLEX_TIME_DESCRIPTION}
                                </MenuItem>
                              ))}
                            </CustomTextField>
                          )}
                        />
                      </Grid>

                      {/*----------- Total Day -----------*/}
                      <Grid item xs={12}>
                        <Controller
                          name='TOTAL_DAY'
                          control={control}
                          render={({ field: { onChange, ...field } }) => (
                            <CustomTextField
                              {...field}
                              fullWidth
                              type='number'
                              label={t('Total Day')}
                              error={!!errors.TOTAL_DAY}
                              helperText={errors.TOTAL_DAY?.message}
                              onChange={e => onChange(Number(e.target.value))}
                              InputProps={{
                                readOnly: true,
                                endAdornment: isCalculating ? <CircularProgress size={20} /> : null
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {/*----------- Description / Reason -----------*/}
                      <Grid item xs={12}>
                        <Controller
                          name='DESCRIPTION'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              fullWidth
                              multiline
                              rows={3}
                              label={t('Reason')}
                              placeholder={t('Enter reason')}
                              error={!!errors.DESCRIPTION}
                              helperText={errors.DESCRIPTION?.message}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
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
            disabled={isPending || isInitialLoading || isCalculating}
            startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {isPending ? t('Saving...') : t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Modal */}
      <ConfirmModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        isLoading={isUpdating}
        title={t('Confirm Edit')}
        description={t('Are you sure you want to save changes?')}
      />
    </>
  )
}

export default UserFlexTimeEditModal
