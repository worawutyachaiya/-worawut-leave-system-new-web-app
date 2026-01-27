// React Imports
import { useEffect, useMemo, useState } from 'react'

// Third-party Imports
import dayjs from 'dayjs'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid, Divider, FormHelperText } from '@mui/material'

// React Hook Form Imports
import { Controller, useFormContext } from 'react-hook-form'

// React Query Imports
import { useQueryClient } from '@tanstack/react-query'

// Hooks Imports
import { useLeaveTypeMaxDay } from '@/_workspace/react-query/hooks/useLeaveTypeMaxDay'
import { useLeaveHolidayCompany } from '@/_workspace/react-query/hooks/useLeaveHolidayCompany'
import { useCreate75Form, PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useCreate75Form'

// Fetch Imports
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import fetchLeaveTypeHR from '@/_workspace/react-select/async-promise-load-options/fetchLeaveTypeHR'

// Components Imports
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import CustomTextField from '@/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import LeaveRequestConfirmModal from './modal/LeaveRequestConfirmModal'
import LeaveRequestSuccessModal, { MessageType } from './modal/LeaveRequestSuccessModal'

// Types & Utils Imports
import { FormDataPage } from './validationSchema'
import { getImgLeaveType } from '../../../assets/leave-type-function/ImgLeaveType'
import {
  TimeLeaveOption,
  oneDayTimeLeaveArr,
  multipleDayTimeLeaveArr,
  timeLeaveArrM2L,
  timeLeaveArrWFH
} from './timeLeaveOptions'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

function M75Form() {
  // Hooks
  const { t } = useTranslation()
  const { control, handleSubmit, watch, setValue, reset, getValues } = useFormContext<FormDataPage>()
  const queryClient = useQueryClient()

  // States for Modals
  const [confirmModal, setConfirmModal] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [resultModal, setResultModal] = useState({
    open: false,
    message: '',
    title: '',
    type: 'success' as MessageType
  })

  // React Query Mutations
  const { mutateAsync: create75Form, isPending } = useCreate75Form()

  // Watch Values
  const watchEmployeeCode = watch('searchFilters.employeeCode')
  const watchLeaveType = watch('searchFilters.leaveType')
  const watchStartDate = watch('searchFilters.startDate')
  const watchEndDate = watch('searchFilters.endDate')
  const watchLeaveTime = watch('searchFilters.leaveTime')

  // Holidays + helpers
  const { data: leaveTypeMaxDayData } = useLeaveTypeMaxDay()
  const { data: holidayCompanyData } = useLeaveHolidayCompany({}, true)

  const companyHolidays: Date[] = holidayCompanyData?.data?.ResultOnDb?.map((h: any) => new Date(h.day_holiday)) || []

  // Derived state: multi-day leave
  const isMoreOneDay = useMemo(() => {
    if (!watchStartDate || !watchEndDate) return false
    const start = dayjs(watchStartDate)
    const end = dayjs(watchEndDate)
    return end.diff(start, 'day') > 0
  }, [watchStartDate, watchEndDate])

  // Helper functions
  const isHoliday = (date: dayjs.Dayjs, holidays: Date[]): boolean => {
    const dateStr = date.format('YYYY-MM-DD')
    return holidays.some(holiday => dayjs(holiday).format('YYYY-MM-DD') === dateStr)
  }

  const countWorkingDays = (startDate: string, endDate: string, holidays: Date[]): number => {
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    let workingDays = 0
    let current = start
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      if (!isHoliday(current, holidays)) workingDays++
      current = current.add(1, 'day')
    }
    return workingDays
  }

  const getDayFromTimeLeave = (timeLeaveValue: string | undefined): number => {
    if (!timeLeaveValue) return 0

    // Match exact logic from old code
    if (timeLeaveValue === '08.30-17.30' || timeLeaveValue === '20.30-05.30') {
      return 1
    } else if (timeLeaveValue === '08.30-10.30' || timeLeaveValue === '15.30-17.30') {
      return 0.25
    } else {
      return 0.5
    }
  }

  const calculateTotalDayLeave = (): string => {
    if (!watchStartDate || !watchEndDate || !watchLeaveTime) return '0'

    setIsCalculating(true)

    const leaveTypeId = watchLeaveType?.LEAVE_TYPE_ID
    const workingDays = countWorkingDays(watchStartDate, watchEndDate, companyHolidays)

    if (workingDays === 0) {
      setIsCalculating(false)
      return '0'
    }

    const dayFromTime = getDayFromTimeLeave(watchLeaveTime)

    // Special case for leave type 7 or 6: include holidays in calculation
    if (leaveTypeId === 7 || leaveTypeId === 6) {
      const start = dayjs(watchStartDate)
      const end = dayjs(watchEndDate)
      const totalDays = end.diff(start, 'day') + 1
      const result = (totalDays * dayFromTime).toString()
      setIsCalculating(false)
      return result
    }

    // For multi-day leaves
    if (workingDays > 1) {
      if (dayFromTime === 1) {
        setIsCalculating(false)
        return workingDays.toString()
      }
      setIsCalculating(false)
      return workingDays.toString()
    }

    setIsCalculating(false)
    return dayFromTime.toString()
  }

  const getMaxDayByLeaveTypeId = (leaveTypeId: number): number => {
    const found = leaveTypeMaxDayData?.data?.ResultOnDb?.find((item: any) => item.LEAVE_TYPE_ID === leaveTypeId)
    return found ? parseFloat(found.LEAVE_TYPE_MAX_DAY) : 0
  }

  const currentMaxDay = watchLeaveType?.LEAVE_TYPE_ID ? getMaxDayByLeaveTypeId(watchLeaveType.LEAVE_TYPE_ID) : 0

  const getMaxEndDate = (): Date | undefined => {
    if (!watchStartDate || !currentMaxDay || currentMaxDay <= 0) return undefined
    let workingDaysCount = 0
    let currentDate = dayjs(watchStartDate)
    while (workingDaysCount < currentMaxDay) {
      if (!isHoliday(currentDate, companyHolidays)) workingDaysCount++
      if (workingDaysCount < currentMaxDay) currentDate = currentDate.add(1, 'day')
    }
    return currentDate.toDate()
  }

  const getTimeLeaveOptions = (): TimeLeaveOption[] => {
    const leaveTypeId = watchLeaveType?.LEAVE_TYPE_ID
    if (leaveTypeId === 6) return timeLeaveArrM2L
    if (leaveTypeId === 11) return timeLeaveArrWFH
    if (isMoreOneDay) return multipleDayTimeLeaveArr
    if (leaveTypeId && [17, 18, 20].includes(leaveTypeId)) return multipleDayTimeLeaveArr
    return oneDayTimeLeaveArr
  }

  // Reset End Date & Time when Leave Type changes
  useEffect(() => {
    if (watchLeaveType) {
      const leaveTypeId = watchLeaveType.LEAVE_TYPE_ID

      // For M2L (type 6), auto-set end date to 97 days from start date
      if (leaveTypeId === 6 && watchStartDate) {
        const endDate = dayjs(watchStartDate).add(97, 'day').format('YYYY-MM-DD')
        setValue('searchFilters.endDate', endDate as any)
      } else {
        setValue('searchFilters.endDate', '' as any)
      }

      setValue('searchFilters.leaveTime', null as any)
    }
  }, [watchLeaveType?.LEAVE_TYPE_ID])

  // Auto-set End Date when Start Date changes (for M2L type)
  useEffect(() => {
    if (watchStartDate && watchLeaveType?.LEAVE_TYPE_ID === 6) {
      const endDate = dayjs(watchStartDate).add(97, 'day').format('YYYY-MM-DD')
      setValue('searchFilters.endDate', endDate as any)
    }
  }, [watchStartDate, watchLeaveType?.LEAVE_TYPE_ID])

  // Update Total เมื่อค่าเปลี่ยน
  useEffect(() => {
    const total = calculateTotalDayLeave()
    setValue('searchFilters.totalDayLeave', total)
  }, [watchStartDate, watchEndDate, watchLeaveTime, setValue])

  // --- Handlers ---
  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onError = (errors: any) => {}

  const handleConfirmSubmit = async () => {
    const searchFilters = getValues('searchFilters')

    try {
      const leaveTypeId = searchFilters.leaveType?.LEAVE_TYPE_ID
      const employeeList = searchFilters.employeeCode || []

      if (!employeeList || employeeList.length === 0) {
        setConfirmModal(false)
        setResultModal({
          open: true,
          message: 'กรุณาเลือกพนักงานอย่างน้อย 1 คน',
          title: 'เกิดข้อผิดพลาด',
          type: 'error'
        })
        return
      }

      // Build EMPLOYEE_CODE array with all selected employees
      const employeeCodeArray = employeeList.map(emp => ({
        EMPLOYEE_CODE: emp.EMPLOYEE_CODE
      }))

      // Create single dataItem with all employees
      const dataItem = {
        EMPLOYEE_CODE: employeeCodeArray,
        CREATE_BY: getUserData()?.EMPLOYEE_CODE || '',
        LEAVE_TYPE: leaveTypeId || 0,
        START_DATE: searchFilters.startDate || '',
        END_DATE: searchFilters.endDate || '',
        LEAVE_TIME: searchFilters.leaveTime || '',
        TOTAL_DAY_LEAVE: searchFilters.totalDayLeave || '0',
        REASON: searchFilters.reason || '',
        REMARK: searchFilters.remark || ''
      }

      const response = await create75Form(dataItem as any)

      setConfirmModal(false)

      if (response.data && response.data.Status === true) {
        setResultModal({
          open: true,
          message: `บันทึกคำขอลา M.75 สำเร็จสำหรับ ${employeeList.length} คน`,
          title: 'สำเร็จ!',
          type: 'success'
        })

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['EMPLOYEE_LEAVE_BALANCE'] })
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
        queryClient.invalidateQueries({ queryKey: ['LEAVE_HISTORY'] })
        queryClient.invalidateQueries({ queryKey: ['EMPLOYEE'] })

        // Reset form on success
        handleClear()
      } else {
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
        message: 'เกิดข้อผิดพลาดในการบันทึก M.75',
        title: 'เกิดข้อผิดพลาด',
        type: 'error'
      })
    }
  }

  const handleClear = () => {
    reset({
      searchFilters: {
        employeeCode: [] as any,
        leaveType: null as any,
        startDate: null as any,
        endDate: null as any,
        leaveTime: null as any,
        totalDayLeave: '0',
        reason: '',
        remark: ''
      }
    })
  }

  return (
    <>
      <Card sx={{ overflow: 'visible', zIndex: 4 }}>
        <CardHeader title={t('M75 Form')} titleTypographyProps={{ variant: 'h5' }} />
        <Divider />
        <CardContent>
          <Grid container spacing={4}>
            {/* -------------- Employee Code Multi-select -------------- */}
            <Grid item xs={12} md={6}>
              <Controller
                name='searchFilters.employeeCode'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <AsyncSelectCustom
                      {...field}
                      isMulti
                      closeMenuOnSelect={false}
                      label={t('Employee Code')}
                      placeholder={t('Select employee codes (multiple)')}
                      defaultOptions
                      loadOptions={async (inputValue: string) => {
                        const response = await fetchAllEmployee({ EMPLOYEE_ID: inputValue })
                        return response as any
                      }}
                      getOptionLabel={(data: any) => data.EMPLOYEE_CODE}
                      getOptionValue={(data: any) => data.EMPLOYEE_CODE}
                      classNamePrefix={'select'}
                      styles={{
                        multiValue: base => ({
                          ...base,
                          backgroundColor: 'var(--mui-palette-action-selected)',
                          borderRadius: '4px'
                        }),
                        multiValueLabel: base => ({
                          ...base,
                          color: 'var(--mui-palette-text-primary)'
                        }),
                        multiValueRemove: base => ({
                          ...base,
                          color: 'var(--mui-palette-text-primary)',
                          ':hover': {
                            backgroundColor: 'var(--mui-palette-error-main)',
                            color: 'white'
                          }
                        })
                      }}
                    />
                    <FormHelperText error={!!error}>{error?.message}</FormHelperText>
                  </>
                )}
              />
            </Grid>

            {/*------------ Leave Type ------------------*/}
            <Grid item xs={12} md={6}>
              <Controller
                name='searchFilters.leaveType'
                control={control}
                render={({ field: { ref, ...fieldProps }, fieldState: { error } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={async () => {
                      const result = await fetchLeaveTypeHR()
                      return result as any
                    }}
                    getOptionValue={(data: any) => data?.LEAVE_TYPE_ID?.toString() || ''}
                    getOptionLabel={(data: any) =>
                      `${data?.LEAVE_TYPE_DESCRIPTION_EN} / ${data?.LEAVE_TYPE_DESCRIPTION_TH}` || ''
                    }
                    formatOptionLabel={(data: any) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>{getImgLeaveType(Number(data.LEAVE_TYPE_ID))}</div>
                        <span>
                          {data.LEAVE_TYPE_DESCRIPTION_EN} / {data.LEAVE_TYPE_DESCRIPTION_TH}
                        </span>
                      </div>
                    )}
                    classNamePrefix='select'
                    label={t('Leave Type')}
                    placeholder={t('Select Leave Type')}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/*------------ Start Date ------------------*/}
            <Grid item xs={12} md={6}>
              <Controller
                name='searchFilters.startDate'
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <AppReactDatepicker
                    selected={value ? new Date(value) : null}
                    onChange={(date: Date | null) => {
                      onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)
                      // Auto-set end date when start date changes
                      if (date) {
                        if (watchLeaveType?.LEAVE_TYPE_ID === 6) {
                          // M2L: set 97 days from start
                          setValue('searchFilters.endDate', dayjs(date).add(97, 'day').format('YYYY-MM-DD'))
                        } else {
                          // Others: set same as start date
                          setValue('searchFilters.endDate', dayjs(date).format('YYYY-MM-DD'))
                        }
                      }
                    }}
                    placeholderText={t('Select Date')}
                    disabled={!watchLeaveType}
                    minDate={new Date()}
                    excludeDates={companyHolidays}
                    highlightDates={companyHolidays}
                    autoComplete='off'
                    customInput={
                      <CustomTextField
                        label={`${t('Start Date')}${currentMaxDay > 0 ? ` (Available ${currentMaxDay} Days)` : ''}`}
                        fullWidth
                        error={!!error}
                        helperText={error?.message || (!watchLeaveType ? t('Please Select Leave Type First') : '')}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/*------------ End Date ------------------*/}
            <Grid item xs={12} md={6}>
              <Controller
                name='searchFilters.endDate'
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <AppReactDatepicker
                    autoComplete='off'
                    selected={value ? new Date(value) : null}
                    onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                    placeholderText={t('Select Date')}
                    disabled={!watchStartDate}
                    minDate={watchStartDate ? new Date(watchStartDate) : new Date()}
                    maxDate={getMaxEndDate()}
                    excludeDates={companyHolidays}
                    highlightDates={companyHolidays}
                    customInput={
                      <CustomTextField
                        label={t('End Date')}
                        fullWidth
                        error={!!error}
                        helperText={error?.message || (!watchStartDate ? 'กรุณาเลือกวันเริ่มต้นก่อน' : '')}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/*------------ Time ------------------*/}
            <Grid item xs={12} md={6}>
              <Controller
                name='searchFilters.leaveTime'
                control={control}
                render={({ field: { onChange, value, ...fieldRest }, fieldState: { error } }) => (
                  <AsyncSelectCustom
                    {...fieldRest}
                    value={value ? getTimeLeaveOptions().find(opt => opt.value === value) : null}
                    onChange={(selected: TimeLeaveOption | null) => onChange(selected?.value || null)}
                    label={t('Time')}
                    placeholder={t('Select leave time')}
                    isSearchable={false}
                    isClearable
                    defaultOptions={getTimeLeaveOptions()}
                    loadOptions={() => Promise.resolve(getTimeLeaveOptions())}
                    getOptionValue={(option: TimeLeaveOption) => option?.value || ''}
                    getOptionLabel={(option: TimeLeaveOption) => option?.label || ''}
                    classNamePrefix='select'
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/*------------ Total Day Leave ------------------*/}
            <Grid item xs={12} md={6}>
              <Controller
                name='searchFilters.totalDayLeave'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Total Day Leave')}
                    placeholder='0'
                    InputProps={{ readOnly: true, sx: { bgcolor: 'action.hover' } }}
                  />
                )}
              />
            </Grid>

            {/*------------ Remark ------------------*/}
            <Grid item xs={12}>
              <Controller
                name='searchFilters.remark'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth multiline rows={4} label={t('Remark (Optional)')} />
                )}
              />
            </Grid>

            {/* ----------------- Buttons ------------------ */}
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type='button'
                variant='contained'
                color='primary'
                onClick={handleSubmit(onSubmit, onError)}
                disabled={isPending || isCalculating}
                sx={{ color: 'white', bgcolor: 'primary.main' }}
              >
                {isCalculating ? t('Calculating...') : isPending ? t('Submitting...') : t('Submit')}
              </Button>
              <Button
                type='button'
                variant='tonal'
                color='secondary'
                onClick={handleClear}
                disabled={isPending || isCalculating}
              >
                {t('Clear')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ----------------- Modals ------------------ */}
      <LeaveRequestConfirmModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
      <LeaveRequestSuccessModal
        open={resultModal.open}
        onClose={() => setResultModal(prev => ({ ...prev, open: false }))}
        message={resultModal.message}
        title={resultModal.title}
        type={resultModal.type}
      />
    </>
  )
}

export default M75Form
