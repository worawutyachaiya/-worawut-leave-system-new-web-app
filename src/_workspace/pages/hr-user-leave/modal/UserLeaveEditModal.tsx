// React Imports
import { useEffect, useMemo, useState } from 'react'

// Confirm Modal
import ConfirmModal from './ConfirmModal'

// MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  IconButton,
  Box,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

// React Hook Form
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'

// Components
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// Utils & Hooks
import { fetchLeaveTypeAll } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveTypeAll'
import { useLeaveTypeMaxDay } from '@/_workspace/react-query/hooks/useLeaveTypeMaxDay'
import { useLeaveHolidayCompany } from '@/_workspace/react-query/hooks/useLeaveHolidayCompany'
import { useSearchFlexTimeBySpecificDate } from '@/_workspace/react-query/hooks/useFlexTime'
import { useLeaveEmployeeBalance, getRemainDayByLeaveType } from '@/_workspace/react-query/hooks/useLeaveEmployeeBalance'

// Local Imports
import { getImgLeaveType } from '@/_workspace/pages/leave-history/leave-history-function/ImgLeaveType'
import {
  oneDayTimeLeaveArr,
  multipleDayTimeLeaveArr,
  timeLeaveArrM2L,
  timeLeaveArrWFH,
  TimeLeaveOption,
  oneDayTimeLeaveArrWithFlexTimeTypeFaster,
  oneDayTimeLeaveArrWithFlexTimeTypeSlower
} from './timeLeaveOptions'

// Types and Validation
import { UserLeaveInterface } from '@/_workspace/types/hr-user-leave/HrUserLeave'
import { editUserLeaveSchema, EditUserLeaveFormData } from './validationSchema'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

interface UserLeaveEditModalProps {
  open: boolean
  onClose: () => void
  selectedLeave: UserLeaveInterface | null
  onSave: (data: any) => void
}

const UserLeaveEditModal = ({ open, onClose, selectedLeave, onSave }: UserLeaveEditModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<EditUserLeaveFormData>({
    resolver: zodResolver(editUserLeaveSchema),
    defaultValues: {
      leaveType: undefined,
      startDate: '',
      endDate: '',
      time: undefined,
      totalLeaveDay: '',
      cancelAttachment: 'no',
      reason: ''
    }
  })

  // Watch values
  const watchLeaveType = watch('leaveType')
  const watchStartDate = watch('startDate')
  const watchEndDate = watch('endDate')
  const watchTime = watch('time')
  const watchTotalLeaveDay = watch('totalLeaveDay')
  const watchReason = watch('reason')

  // Derived state: multi-day leave
  const isMoreOneDay = useMemo(() => {
    if (!watchStartDate || !watchEndDate) return false
    const start = dayjs(watchStartDate)
    const end = dayjs(watchEndDate)
    return end.diff(start, 'day') > 0
  }, [watchStartDate, watchEndDate])

  // Helper: parse day count from time value (matching old implementation)
  const getDayFromTimeLeave = (timeLeaveValue: string | undefined): number => {
    if (!timeLeaveValue) return 0

    // Match the old implementation logic
    if (timeLeaveValue === '08.30-17.30' || timeLeaveValue === '20.30-05.30') {
      return 1
    } else if (timeLeaveValue === '08.30-10.30' || timeLeaveValue === '15.30-17.30') {
      return 0.25
    } else {
      return 0.5
    }
  }

  // Find Time Option from DB value
  const findTimeOption = (timeValue: string | undefined): TimeLeaveOption | null => {
    if (!timeValue) return null
    const allOptions = [
      ...oneDayTimeLeaveArr,
      ...multipleDayTimeLeaveArr,
      ...timeLeaveArrM2L,
      ...timeLeaveArrWFH,
      ...oneDayTimeLeaveArrWithFlexTimeTypeFaster,
      ...oneDayTimeLeaveArrWithFlexTimeTypeSlower
    ]
    return allOptions.find(opt => opt.value === timeValue) || { value: timeValue, label: timeValue }
  }

  // Hooks
  const { data: leaveTypeMaxDayData } = useLeaveTypeMaxDay()
  const { data: holidayCompanyData } = useLeaveHolidayCompany({}, true)

  // Reset form when modal opens with selected leave data
  useEffect(() => {
    if (open && selectedLeave) {
      const timeVal = selectedLeave.LEAVE_REQUEST_TIME || selectedLeave.TIME
      const timeOption = findTimeOption(timeVal)

      reset({
        leaveType: selectedLeave.LEAVE_TYPE_ID
          ? {
            value: selectedLeave.LEAVE_TYPE_ID,
            label: selectedLeave.LEAVE_TYPE_DESCRIPTION_TH || selectedLeave.LEAVE_TYPE || ''
          }
          : undefined,
        startDate: selectedLeave.LEAVE_REQUEST_START_DATE
          ? dayjs(selectedLeave.LEAVE_REQUEST_START_DATE).format('YYYY-MM-DD')
          : '',
        endDate: selectedLeave.LEAVE_REQUEST_END_DATE
          ? dayjs(selectedLeave.LEAVE_REQUEST_END_DATE).format('YYYY-MM-DD')
          : '',
        time: timeOption || undefined,
        totalLeaveDay: selectedLeave.LEAVE_REQUEST_TOTAL_DAY || selectedLeave.TOTAL_DAY_LEAVE || '',
        cancelAttachment: 'no',
        reason: selectedLeave.LEAVE_REQUEST_REASON || selectedLeave.REASON || ''
      })
    }
  }, [open, selectedLeave, reset])

  // Flex time lookup - IMPORTANT: enabled only when we have BOTH dates to prevent 400 Bad Request
  const employeeCode = selectedLeave?.EMPLOYEE_CODE || selectedLeave?.EMPLOYEE_ID || ''
  const { data: flexDateData } = useSearchFlexTimeBySpecificDate(
    { EMPLOYEE_CODE: employeeCode, START_DATE: watchStartDate, END_DATE: watchEndDate },
    !!employeeCode && !!watchStartDate && !!watchEndDate  // Must have END_DATE too!
  )

  const companyHolidays: Date[] = holidayCompanyData?.data?.ResultOnDb?.map((h: any) => new Date(h.day_holiday)) || []

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

  const calculateTotalDayLeave = (): string => {
    if (!watchStartDate || !watchEndDate || !watchTime) return '0'

    const timeValue = watchTime?.value
    if (!timeValue) return '0'

    // Get time multiplier (matching old implementation)
    const timeMultiplier = getDayFromTimeLeave(timeValue)

    // Check if this is WFH leave type (LEAVE_TYPE_ID === 7 in old code = 11 now?)
    // For WFH, don't exclude holidays
    const leaveTypeId = Number(watchLeaveType?.value)
    if (leaveTypeId === 7 || leaveTypeId === 11) {
      // Calculate total days including holidays (like old code)
      const start = dayjs(watchStartDate)
      const end = dayjs(watchEndDate)
      const totalDays = end.diff(start, 'day') + 1
      return (totalDays * timeMultiplier).toString()
    }

    // For other leave types, exclude holidays
    const workingDays = countWorkingDays(watchStartDate, watchEndDate, companyHolidays)
    return (workingDays * timeMultiplier).toString()
  }

  // Effect: Update Total Day Leave
  useEffect(() => {
    // Only calculate if form values are present and seemingly valid
    // This effect runs on mount/reset too, which is tricky.
    // However, if reset provides valid data, calculation *should* match.
    // If we want to avoid overwriting DB value with potentially different calculated value on exact load,
    // we might check if isDirty? No, isDirty is complex.
    // Let's assume calculation is correct. If DB has 1 and we calculate 1, no harm.
    // If DB has 0.5 and we calculate 1 (due to bad time label), we fixed time label above.

    // Determine if we should calculate:
    if (watchStartDate && watchEndDate && watchTime) {
      const total = calculateTotalDayLeave()
      // Avoid setting if it's the same to prevent loops (though setValue handles strict equality optimization usually)
      // But also, if we just reset, we might want to respect the reset value if it somehow differs?
      // Easiest is to just calculate.
      const currentTotal = getValues('totalLeaveDay')
      if (String(total) !== String(currentTotal)) {
        setValue('totalLeaveDay', total)
      }
    }
  }, [watchStartDate, watchEndDate, watchTime, setValue, getValues])

  // Helper: Get Max Max Day
  const getMaxDayByLeaveTypeId = (leaveTypeId: number): number => {
    const found = leaveTypeMaxDayData?.data?.ResultOnDb?.find((item: any) => item.LEAVE_TYPE_ID === leaveTypeId)
    return found ? parseFloat(found.LEAVE_TYPE_MAX_DAY) : 0
  }

  const currentMaxDay = watchLeaveType?.value ? getMaxDayByLeaveTypeId(Number(watchLeaveType.value)) : 0

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

  // Effect: Reset End Date & Time when Leave Type changes (if manually changed)
  // Note: We might not want to aggressively reset if we are just loading initial data, 
  // but for editing, if user changes leave type, we probably should.
  // We'll trust the user interaction here.

  const getTimeLeaveOptions = (): TimeLeaveOption[] => {
    const leaveTypeId = Number(watchLeaveType?.value)

    // M2L leave type (ID 5 in old code, 6 in new?)
    if (leaveTypeId === 5 || leaveTypeId === 6) return timeLeaveArrM2L

    // WFH leave type (ID 11)
    if (leaveTypeId === 11) return timeLeaveArrWFH

    // Multi-day leave
    if (isMoreOneDay) return multipleDayTimeLeaveArr

    // Special leave types: OS, WO, TRN (17, 18, 20)
    if (leaveTypeId && [17, 18, 20].includes(leaveTypeId)) return multipleDayTimeLeaveArr

    // Flex time handling
    const flexRecords = flexDateData?.data?.ResultOnDb
    if (Array.isArray(flexRecords) && flexRecords.length > 0) {
      const desc = flexRecords[0]?.FLEX_TIME_DESCRIPTION || ''
      if (desc === '07.30-16.30') return oneDayTimeLeaveArrWithFlexTimeTypeFaster
      return oneDayTimeLeaveArrWithFlexTimeTypeSlower
    }

    return oneDayTimeLeaveArr
  }

  // Comparison helpers
  const hasLeaveTypeChanged = !!watchLeaveType?.value && String(watchLeaveType.value) !== String(selectedLeave?.LEAVE_TYPE_ID)
  const hasStartDateChanged = !!watchStartDate && !!selectedLeave?.LEAVE_REQUEST_START_DATE && watchStartDate !== dayjs(selectedLeave.LEAVE_REQUEST_START_DATE).format('YYYY-MM-DD')
  const hasEndDateChanged = !!watchEndDate && !!selectedLeave?.LEAVE_REQUEST_END_DATE && watchEndDate !== dayjs(selectedLeave.LEAVE_REQUEST_END_DATE).format('YYYY-MM-DD')
  const hasTimeChanged = !!watchTime?.value && watchTime.value !== (selectedLeave?.LEAVE_REQUEST_TIME || selectedLeave?.TIME)
  const hasTotalDayChanged = !!watchTotalLeaveDay && String(watchTotalLeaveDay) !== String(selectedLeave?.LEAVE_REQUEST_TOTAL_DAY || selectedLeave?.TOTAL_DAY_LEAVE)
  const hasReasonChanged = watchReason !== (selectedLeave?.LEAVE_REQUEST_REASON || selectedLeave?.REASON || '')

  const renderCompareValue = (oldValue: string, newValue: string | undefined, hasChanged: boolean) => {
    if (!hasChanged || !newValue) return <Typography variant='body1'>{oldValue}</Typography>
    return (
      <Box>
        <Typography variant='body1' sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
          {oldValue}
        </Typography>
        <Typography variant='body1' sx={{ color: 'success.main', fontWeight: 500 }}>
          → {newValue}
        </Typography>
      </Box>
    )
  }

  // Submit handler - using handleSubmit pattern from other modals
  const handleSave = handleSubmit((data: EditUserLeaveFormData) => {
    // console.log('=== FORM DATA DEBUG ===')
    // console.log('Raw data:', data)
    // console.log('leaveType:', data.leaveType)
    // console.log('time:', data.time)
    // console.log('Errors:', errors)

    // Match the exact structure from old implementation
    const payload = {
      EMPLOYEE_ID: selectedLeave?.EMPLOYEE_CODE || selectedLeave?.EMPLOYEE_ID,
      LEAVE_REQUEST_ID: selectedLeave?.LEAVE_REQUEST_ID,
      OLD_LEAVE_TYPE_ID: selectedLeave?.LEAVE_TYPE_ID,
      NEW_LEAVE_TYPE_ID: data.leaveType?.value || selectedLeave?.LEAVE_TYPE_ID,
      OLD_START_DATE: selectedLeave?.LEAVE_REQUEST_START_DATE,
      NEW_START_DATE: data.startDate || selectedLeave?.LEAVE_REQUEST_START_DATE,
      OLD_END_DATE: selectedLeave?.LEAVE_REQUEST_END_DATE,
      NEW_END_DATE: data.endDate || selectedLeave?.LEAVE_REQUEST_END_DATE,
      OLD_TIME: selectedLeave?.LEAVE_REQUEST_TIME || selectedLeave?.TIME,
      NEW_TIME: data.time?.value || selectedLeave?.LEAVE_REQUEST_TIME || selectedLeave?.TIME,
      OLD_TOTAL_DAY: selectedLeave?.LEAVE_REQUEST_TOTAL_DAY || selectedLeave?.TOTAL_DAY_LEAVE,
      NEW_TOTAL_DAY: data.totalLeaveDay || selectedLeave?.LEAVE_REQUEST_TOTAL_DAY || selectedLeave?.TOTAL_DAY_LEAVE,
      OLD_REASON: selectedLeave?.LEAVE_REQUEST_REASON || selectedLeave?.REASON || '',
      NEW_REASON: data.reason || selectedLeave?.LEAVE_REQUEST_REASON || selectedLeave?.REASON || '',
      IS_DELETE_DOC: data.cancelAttachment === 'yes',
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE || 'ถ้าคุณเห็นข้อความนี้ มีปํญหาแล้ว ติดต่อพี่มอส S524'
    }

    // console.log('UserLeaveEditModal - onSubmit payload:', payload)
    // Store payload and show confirm modal
    setPendingPayload(payload)
    setShowConfirmModal(true)
  })

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<any>(null)

  // When user confirms in confirm modal
  const handleConfirm = () => {
    if (pendingPayload) {
      onSave(pendingPayload)
      setShowConfirmModal(false)
      setPendingPayload(null)
      handleClose()
    }
  }

  // When user cancels in confirm modal
  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setPendingPayload(null)
  }

  // Handle close
  const handleClose = () => {
    onClose()
  }

  if (!selectedLeave) return null

  return (
    <>
      <Dialog
        // Close button
        open={open}
        onClose={onClose}
        maxWidth='md'
        fullWidth
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle>
          <Typography variant='h5' component='span'>
            Edit User Leave
          </Typography>
          {/* Close button */}
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={4}>
            {/* Left Side - Selected Leave Info */}
            <Grid item xs={12} md={5}>
              <Typography variant='h6' gutterBottom>
                Leave Request Selected
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Employee ID
                  </Typography>
                  <Typography variant='body1'>{selectedLeave.EMPLOYEE_CODE || selectedLeave.EMPLOYEE_ID}</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Employee Name
                  </Typography>
                  <Typography variant='body1'>
                    {selectedLeave.EMPLOYEE_NAME} {selectedLeave.EMPLOYEE_SURNAME || ''}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Leave Type
                  </Typography>
                  {renderCompareValue(
                    selectedLeave.LEAVE_TYPE_DESCRIPTION_TH || selectedLeave.LEAVE_TYPE_DESCRIPTION_EN || selectedLeave.LEAVE_TYPE || '-',
                    watchLeaveType?.label,
                    hasLeaveTypeChanged
                  )}
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Start Date
                  </Typography>
                  {renderCompareValue(
                    selectedLeave.LEAVE_REQUEST_START_DATE
                      ? new Date(selectedLeave.LEAVE_REQUEST_START_DATE).toLocaleDateString('th-TH')
                      : (selectedLeave.LEAVE_DATE || '-'),
                    watchStartDate ? new Date(watchStartDate).toLocaleDateString('th-TH') : undefined,
                    hasStartDateChanged
                  )}
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    End Date
                  </Typography>
                  {renderCompareValue(
                    selectedLeave.LEAVE_REQUEST_END_DATE
                      ? new Date(selectedLeave.LEAVE_REQUEST_END_DATE).toLocaleDateString('th-TH')
                      : '-',
                    watchEndDate ? new Date(watchEndDate).toLocaleDateString('th-TH') : undefined,
                    hasEndDateChanged
                  )}
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Leave Time
                  </Typography>
                  {renderCompareValue(
                    selectedLeave.LEAVE_REQUEST_TIME || selectedLeave.TIME || '-',
                    watchTime?.label,
                    hasTimeChanged
                  )}
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Total Leave Day
                  </Typography>
                  {renderCompareValue(
                    String(selectedLeave.LEAVE_REQUEST_TOTAL_DAY || selectedLeave.TOTAL_DAY_LEAVE),
                    watchTotalLeaveDay ? String(watchTotalLeaveDay) : undefined,
                    hasTotalDayChanged
                  )}
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Reason
                  </Typography>
                  {renderCompareValue(
                    selectedLeave.LEAVE_REQUEST_REASON || selectedLeave.REASON || '-',
                    watchReason || undefined,
                    hasReasonChanged
                  )}
                </Box>
              </Box>
            </Grid>

            {/*---------- Right Side - Edit Form ----------*/}
            <Grid item xs={12} md={7}>
              {/* No form wrapper - using button onClick instead */}
              <Grid container spacing={3}>
                {/*--------- Leave Type --------------------------*/}
                <Grid item xs={12}>
                  <Controller
                    name='leaveType'
                    control={control}
                    render={({ field }) => (
                      <AsyncSelectCustom
                        {...field}
                        label='Leave Type *'
                        placeholder='Select leave type'
                        loadOptions={fetchLeaveTypeAll}
                        defaultOptions
                        classNamePrefix={'select'}
                        formatOptionLabel={(data: any) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div>{getImgLeaveType(Number(data.value || data.LEAVE_TYPE_ID))}</div>
                            <span>{data.label || `${data.LEAVE_TYPE_DESCRIPTION_EN} / ${data.LEAVE_TYPE_DESCRIPTION_TH}`}</span>
                          </div>
                        )}
                        onChange={(val: any) => {
                          // IMPORTANT: Convert API format to {value, label} format (matching reset format)
                          if (val) {
                            field.onChange({
                              value: val.LEAVE_TYPE_ID || val.value,
                              label: val.LEAVE_TYPE_DESCRIPTION_TH || val.label || ''
                            })
                          } else {
                            field.onChange(null)
                          }
                        }}
                        error={!!errors.leaveType}
                        helperText={errors.leaveType?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Start Date */}
                <Grid item xs={12}>
                  <Controller
                    name='startDate'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <AppReactDatepicker
                        selected={value ? new Date(value) : null}
                        onChange={(date: Date | null) => {
                          const dateStr = date ? dayjs(date).format('YYYY-MM-DD') : ''
                          onChange(dateStr)
                          // Reset endDate and time when start date changes 
                          setValue('endDate', '')
                        }}
                        placeholderText='Select Start Date'
                        disabled={!watchLeaveType}
                        minDate={new Date()}
                        excludeDates={companyHolidays}
                        highlightDates={companyHolidays}
                        autoComplete='off'
                        customInput={
                          <CustomTextField
                            label={`Start Date ${currentMaxDay > 0 ? `(Available ${currentMaxDay} Days)` : ''} *`}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.startDate}
                            helperText={errors.startDate?.message}
                            InputProps={{ readOnly: true }}
                          />
                        }
                      />
                    )}
                  />
                </Grid>

                {/*--------- End Date ----------------*/}
                <Grid item xs={12}>
                  <Controller
                    name='endDate'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <AppReactDatepicker
                        selected={value ? new Date(value) : null}
                        onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                        placeholderText='Select End Date'
                        disabled={!watchStartDate}
                        minDate={watchStartDate ? new Date(watchStartDate) : new Date()}
                        maxDate={getMaxEndDate()}
                        excludeDates={companyHolidays}
                        highlightDates={companyHolidays}
                        autoComplete='off'
                        customInput={
                          <CustomTextField
                            label='End Date *'
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.endDate}
                            helperText={errors.endDate?.message}
                            InputProps={{ readOnly: true }}
                          />
                        }
                      />
                    )}
                  />
                </Grid>

                {/*--------- Time ----------------*/}
                <Grid item xs={12}>
                  <Controller
                    name='time'
                    control={control}
                    render={({ field }) => (
                      <AsyncSelectCustom
                        {...field}
                        label='Time *'
                        placeholder='Select time'
                        isSearchable={false}
                        classNamePrefix={'select'}
                        defaultOptions={getTimeLeaveOptions()}
                        loadOptions={() => Promise.resolve(getTimeLeaveOptions())}
                        error={!!errors.time}
                        helperText={errors.time?.message}
                      />
                    )}
                  />
                </Grid>

                {/*--------- Total Leave Day ----------------*/}
                <Grid item xs={12}>
                  <Controller
                    name='totalLeaveDay'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        disabled
                        label='Total Leave Day'
                        error={!!errors.totalLeaveDay}
                        helperText={errors.totalLeaveDay?.message}
                      />
                    )}
                  />
                </Grid>

                {/*--------- Cancel Attachment ----------------*/}
                <Grid item xs={12}>
                  <Controller
                    name='cancelAttachment'
                    control={control}
                    render={({ field }) => (
                      <FormControl component='fieldset'>
                        <FormLabel component='legend'>Want to cancel leave attachment :</FormLabel>
                        <RadioGroup {...field} row>
                          <FormControlLabel value='yes' control={<Radio />} label='Yes' />
                          <FormControlLabel value='no' control={<Radio />} label='No' />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </Grid>

                {/*--------- Reason ----------------*/}
                <Grid item xs={12}>
                  <Controller
                    name='reason'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label='Reason'
                        placeholder='Enter a reason'
                        error={!!errors.reason}
                        helperText={errors.reason?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary'>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            variant='contained'
            color='primary'
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Modal */}
      <ConfirmModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
      />
    </>
  )
}

export default UserLeaveEditModal
