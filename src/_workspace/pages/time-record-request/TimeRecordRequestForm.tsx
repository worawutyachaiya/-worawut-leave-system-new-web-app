import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, Grid, CircularProgress, Divider } from '@mui/material'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useCreateTimeRecord } from '@/_workspace/react-query/hooks/useTimeRecordRequest'
import { fetchTimeRecordTypes } from '@/_workspace/react-select/async-promise-load-options/fetchTimeRecordTypes'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SkeletonCustom from '@/components/SkeletonCustom'
import CustomTextField from '@/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import TimeRecordConfirmModal from './modal/TimeRecordConfirmModal'
import TimeRecordSuccessModal, { MessageType } from './modal/TimeRecordSuccessModal'
import { FormDataPage } from './validationSchema'
import type { TimeRecordTypeI } from '@/_workspace/types/time-record/TimeRecordInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useTranslation } from '@/contexts/TranslationContext'
import {th, enGB} from 'date-fns/locale'

function TimeRecordRequestForm() {
  const { t, locale } = useTranslation()

  const [resultModal, setResultModal] = useState({
    open: false,
    message: '',
    title: '',
    type: 'success' as MessageType
  })
  const [confirmModal, setConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { control, handleSubmit, watch, reset, getValues } = useFormContext<FormDataPage>()
  const { isLoading, errors } = useFormState({ control })
  const watchTimeRecordType = watch('searchFilters.timeRecordType')
  const showReasonField = watchTimeRecordType?.TIME_RECORD_TYPE_ID === 4
  const { mutateAsync: createTimeRecord } = useCreateTimeRecord()
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setConfirmModal(true)
  }
  const handleConfirmSubmit = async (): Promise<void> => {
    const searchFilters = getValues('searchFilters')
    setIsSubmitting(true)
    try {
      const dataItem = {
        TIMEIN: searchFilters.timeIn,
        TIMEOUT: searchFilters.timeOut,
        DATEIN: dayjs(searchFilters.dateIn).format('YYYY-MM-DD'),
        DATEOUT: dayjs(searchFilters.dateOut).format('YYYY-MM-DD'),
        TYPE: searchFilters?.timeRecordType?.TIME_RECORD_TYPE_ID,
        REASON: searchFilters.reason || '',
        EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || ''
      }
      const response = await createTimeRecord(dataItem)
      if (response.data && response.data.Status === true) {
        if ((response.data as any).MessageWarning) {
          setConfirmModal(false)
          setResultModal({
            open: true,
            message: response.data.Message || '',
            title: 'คำเตือน',
            type: 'warning'
          })
        } else {
          setConfirmModal(false)
          setResultModal({
            open: true,
            message: response.data.Message || 'บันทึกคำขอสำเร็จ',
            title: 'สำเร็จ!',
            type: 'success'
          })
        }
        queryClient.invalidateQueries({ queryKey: ['TIME_RECORD'] })
        handleClear()
      } else {
        setConfirmModal(false)
        setResultModal({
          open: true,
          message: response.data?.Message || 'เกิดข้อผิดพลาดในการบันทึก',
          title: 'เกิดข้อผิดพลาด',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      setConfirmModal(false)
      setResultModal({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึก',
        title: 'เกิดข้อผิดพลาด',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('=== Form Validation Errors ===')
    console.log('Errors:', errors)
    console.log('=== End Errors ===')
  }
  const handleClear = () => {
    reset({
      searchFilters: {
        timeIn: '08:30',
        timeOut: '17:30',
        dateIn: '',
        dateOut: '',
        timeRecordType: null as any,
        reason: ''
      }
    })
  }
  return (
    <>
      <Card style={{ overflow: 'visible', zIndex: 4 }}>
        <CardHeader
          title={t('Time Record Request Form')}
          titleTypographyProps={{ variant: 'h5' }}
          sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
        />
        <Divider />
        <CardContent>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <Grid container spacing={8}>
                {/* Row 1: Time In & Date In */}
                <Grid item xs={12} md={3}>
                  <Controller
                    name='searchFilters.timeIn'
                    control={control}
                    defaultValue='08:30'
                    render={({ field: { value, onChange } }) => {
                      const selectedDate = value
                        ? dayjs()
                            .set('hour', parseInt(value.split(':')[0]))
                            .set('minute', parseInt(value.split(':')[1]))
                            .toDate()
                        : null
                      return (
                        <AppReactDatepicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => onChange(date ? dayjs(date).format('HH:mm') : '')}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          dateFormat='HH:mm'
                          timeFormat='HH:mm'
                          placeholderText='Select time'
                          customInput={
                            <CustomTextField
                              fullWidth
                              label={t('in time')}
                              placeholder='Select time'
                              error={!!errors.searchFilters?.timeIn}
                              helperText={t(errors.searchFilters?.timeIn?.message || '')}
                              InputProps={{
                                endAdornment: (
                                  <i
                                    className='tabler-clock'
                                    style={{ fontSize: '1.5rem', color: 'rgba(0, 0, 0, 0.54)' }}
                                  />
                                )
                              }}
                            />
                          }
                        />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={9}>
                  <Controller
                    name='searchFilters.dateIn'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <AppReactDatepicker
                        autoComplete='off'
                        locale={locale === 'th' ? th : enGB}
                        selected={value ? new Date(value) : null}
                        openToDate={value ? new Date(value) : dayjs().set('hour', 8).set('minute', 30).toDate()}
                        onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                        placeholderText={t('Choose a date')}
                        dateFormat='dd MMM yyyy'
                        customInput={
                          <CustomTextField
                            fullWidth
                            label={t('date in')}
                            placeholder={t('Choose a date')}
                            error={!!errors.searchFilters?.dateIn}
                            helperText={t(errors.searchFilters?.dateIn?.message || '')}
                          />
                        }
                      />
                    )}
                  />
                </Grid>
                {/* Row 2: Time Out & Date Out */}
                <Grid item xs={12} md={3}>
                  <Controller
                    name='searchFilters.timeOut'
                    control={control}
                    defaultValue='17:30'
                    render={({ field: { value, onChange } }) => {
                      const selectedDate = value
                        ? dayjs()
                            .set('hour', parseInt(value.split(':')[0]))
                            .set('minute', parseInt(value.split(':')[1]))
                            .toDate()
                        : null
                      return (
                        <AppReactDatepicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => onChange(date ? dayjs(date).format('HH:mm') : '')}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          dateFormat='HH:mm'
                          timeFormat='HH:mm'
                          placeholderText='Select time'
                          customInput={
                            <CustomTextField
                              fullWidth
                              label={t('out time')}
                              placeholder='Select time'
                              error={!!errors.searchFilters?.timeOut}
                              helperText={t(errors.searchFilters?.timeOut?.message || '')}
                              InputProps={{
                                endAdornment: (
                                  <i
                                    className='tabler-clock'
                                    style={{ fontSize: '1.5rem', color: 'rgba(0, 0, 0, 0.54)' }}
                                  />
                                )
                              }}
                            />
                          }
                        />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={9}>
                  <Controller
                    name='searchFilters.dateOut'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <AppReactDatepicker
                        autoComplete='off'
                        locale={locale === 'th' ? th : enGB}
                        selected={value ? new Date(value) : null}
                        onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                        placeholderText={t('Choose a date')}
                        dateFormat='dd MMM yyyy'
                        customInput={
                          <CustomTextField
                            fullWidth
                            label={t('date out')}
                            placeholder={t('Choose a date')}
                            error={!!errors.searchFilters?.dateOut}
                            helperText={t(errors.searchFilters?.dateOut?.message || '')}
                          />
                        }
                      />
                    )}
                  />
                </Grid>
                {/* Row 3: Time Record Type */}
                <Grid item xs={12}>
                  <Controller
                    name='searchFilters.timeRecordType'
                    control={control}
                    render={({ field }) => (
                      <AsyncSelectCustom<TimeRecordTypeI>
                        {...field}
                        label={t('select a reason')}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={fetchTimeRecordTypes}
                        getOptionLabel={(option: TimeRecordTypeI) => option.TIME_RECORD_TYPE_DESCRIPTION}
                        getOptionValue={(option: TimeRecordTypeI) => option.TIME_RECORD_TYPE_ID.toString()}
                        placeholder={t('select a reason')}
                        error={!!errors.searchFilters?.timeRecordType}
                        helperText={t(errors.searchFilters?.timeRecordType?.message || '')}
                        classNamePrefix='select'
                      />
                    )}
                  />
                </Grid>
                {/* Row 4: Reason (แสดงเมื่อ type = 4) */}
                {showReasonField && (
                  <Grid item xs={12}>
                    <Controller
                      name='searchFilters.reason'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label={t('Reason')}
                          placeholder={t('Enter Reason')}
                          error={!!errors.searchFilters?.reason}
                          helperText={errors.searchFilters?.reason?.message}
                          multiline
                          rows={3}
                        />
                      )}
                    />
                  </Grid>
                )}
                {/* Buttons */}
                <Grid item xs={12}>
                  <Button type='submit' variant='contained' color='primary' disabled={isSubmitting} sx={{ mr: 2 }}>
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        {t('Submitting...')}
                      </>
                    ) : (
                      t('Submit')
                    )}
                  </Button>
                  <Button type='button' variant='tonal' color='secondary' onClick={handleClear} disabled={isSubmitting}>
                    {t('Clear')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
      {/* Confirm Modal */}
      <TimeRecordConfirmModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isSubmitting}
      />
      {/* Result Modal */}
      <TimeRecordSuccessModal
        open={resultModal.open}
        onClose={() => setResultModal(prev => ({ ...prev, open: false }))}
        message={resultModal.message}
        title={resultModal.title}
        type={resultModal.type}
      />
    </>
  )
}
export default TimeRecordRequestForm
