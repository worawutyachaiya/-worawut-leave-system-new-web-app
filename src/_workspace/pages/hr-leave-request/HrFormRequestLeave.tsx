// React Imports
import { useState, useEffect, useMemo } from 'react'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  FormHelperText,
  Typography,
  Avatar,
  IconButton,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

// React Hook Form Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

// React Query Imports
import { useQueryClient } from '@tanstack/react-query'

// Third-party Imports
import { useDropzone } from 'react-dropzone'
import dayjs from 'dayjs'

// Hooks Imports
import { useLeaveTypeMaxDay } from '@/_workspace/react-query/hooks/useLeaveTypeMaxDay'
import { useLeaveHolidayCompany } from '@/_workspace/react-query/hooks/useLeaveHolidayCompany'
import {
  useLeaveEmployeeBalance,
  getRemainDayByLeaveType
} from '@/_workspace/react-query/hooks/useLeaveEmployeeBalance'
import {
  useCreateLeaveRequest,
  PREFIX_QUERY_KEY as LEAVE_REQUEST_KEY
} from '@/_workspace/react-query/hooks/useLeaveRequestCreate'
import { useUploadLeaveFile } from '@/_workspace/react-query/hooks/useLeaveFile'
import { useSearchFlexTimeBySpecificDate } from '@/_workspace/react-query/hooks/useFlexTime'

// Fetch Imports
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import { fetchLeaveType } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveType'
import { fetchLeaveTypeAll } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveTypeAll'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import LeaveRequestConfirmModal from '../leave-request/modal/LeaveRequestConfirmModal'
import LeaveRequestSuccessModal, { MessageType } from '../leave-request/modal/LeaveRequestSuccessModal'

// Types & Utils Imports
import { FormDataPage } from './validationSchema'
import { LEAVE_TYPE_IDS } from '@/_workspace/types/leave-employee-balance/LeaveEmployeeBalanceInterface'
import { FileProp } from '@/_workspace/types/leave-file-prop/LeaveFilePropInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { getImgLeaveType } from '../leave-history/leave-history-function/ImgLeaveType'

// Time Leave Options
import {
  oneDayTimeLeaveArr,
  multipleDayTimeLeaveArr,
  timeLeaveArrM2L,
  timeLeaveArrWFH,
  TimeLeaveOption,
  oneDayTimeLeaveArrWithFlexTimeTypeFaster,
  oneDayTimeLeaveArrWithFlexTimeTypeSlower
} from '../leave-request/timeLeaveOptions'

function RequestLeaveFormHr() {
  // States
  const [files, setFiles] = useState<File[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [resultModal, setResultModal] = useState({
    open: false,
    message: '',
    title: '',
    type: 'success' as MessageType
  })
  const [confirmModal, setConfirmModal] = useState(false)

  // React Query Client
  const queryClient = useQueryClient()

  // Hooks: react-hook-form
  const { control, reset, handleSubmit, watch, setValue, getValues } = useFormContext<FormDataPage>()

  // React Query Mutations
  const { mutateAsync: createLeaveRequest, isPending } = useCreateLeaveRequest()
  const { mutateAsync: uploadLeaveFile } = useUploadLeaveFile()

  // Watch employee selection
  const watchEmployeeId = watch('requestLeaveForm.EMPLOYEE_CODE')

  // Update selected Employee Code when form value changes
  useEffect(() => {
    if (watchEmployeeId?.EMPLOYEE_CODE) {
      setSelectedEmployeeId(watchEmployeeId.EMPLOYEE_CODE)
    }
  }, [watchEmployeeId])

  // Watch values for time leave options
  const watchLeaveType = watch('requestLeaveForm.LEAVE_TYPE')
  const watchStartDate = watch('requestLeaveForm.START_DATE')
  const watchEndDate = watch('requestLeaveForm.END_DATE')
  const watchTimeLeave = watch('requestLeaveForm.LEAVE_TIME')

  // derived state: multi-day leave
  const isMoreOneDay = useMemo(() => {
    if (!watchStartDate || !watchEndDate) return false
    const start = dayjs(watchStartDate)
    const end = dayjs(watchEndDate)
    return end.diff(start, 'day') > 0
  }, [watchStartDate, watchEndDate])

  // helper: parse day count from time label
  const getDayFromTimeLeave = (timeLeaveValue: string | undefined): number => {
    if (!timeLeaveValue) return 0
    const match = timeLeaveValue.match(/\((\d+\.?\d*)\s*วัน\)/)
    if (match) return parseFloat(match[1])
    if (timeLeaveValue.includes('0.5') || timeLeaveValue.includes('0.25')) return 0.5
    return 1
  }

  // holidays + helpers
  const { data: leaveTypeMaxDayData } = useLeaveTypeMaxDay()
  const { data: holidayCompanyData } = useLeaveHolidayCompany({}, true)

  const employeeCodeForBalance = watchEmployeeId?.EMPLOYEE_CODE || ''
  const { data: leaveBalanceData } = useLeaveEmployeeBalance(
    { EMPLOYEE_CODE: employeeCodeForBalance },
    !!employeeCodeForBalance
  )

  // Flex time lookup for selected employee + date(s)
  const { data: flexDateData } = useSearchFlexTimeBySpecificDate(
    { EMPLOYEE_CODE: employeeCodeForBalance, START_DATE: watchStartDate, END_DATE: watchEndDate },
    !!employeeCodeForBalance && !!watchStartDate
  )

  // Helper functions สำหรับดึงข้อมูลวันลา
  const getRemainDay = (leaveTypeId: number) => getRemainDayByLeaveType(leaveBalanceData, leaveTypeId)

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
    if (!watchStartDate || !watchEndDate || !watchTimeLeave) return '0'
    const workingDays = countWorkingDays(watchStartDate, watchEndDate, companyHolidays)
    if (workingDays === 0) return '0'
    const dayFromTime = getDayFromTimeLeave(watchTimeLeave?.label)
    if (workingDays > 1) {
      if (dayFromTime === 1) return workingDays.toString()
      return workingDays.toString()
    }
    return dayFromTime.toString()
  }

  useEffect(() => {
    const total = calculateTotalDayLeave()
    setValue('requestLeaveForm.TOTAL_DAY_LEAVE', total)
  }, [watchStartDate, watchEndDate, watchTimeLeave, setValue])

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

  // Reset End Date & Time when Leave Type changes
  useEffect(() => {
    if (watchLeaveType) {
      setValue('requestLeaveForm.END_DATE', '' as any)
      setValue('requestLeaveForm.LEAVE_TIME', null as any)
    }
  }, [watchLeaveType?.LEAVE_TYPE_ID])

  const getTimeLeaveOptions = (): TimeLeaveOption[] => {
    const leaveTypeId = watchLeaveType?.LEAVE_TYPE_ID
    if (leaveTypeId === 6) return timeLeaveArrM2L
    if (leaveTypeId === 11) return timeLeaveArrWFH
    if (isMoreOneDay) return multipleDayTimeLeaveArr
    if (leaveTypeId && [17, 18, 20].includes(leaveTypeId)) return multipleDayTimeLeaveArr
    // If flex time exists for the selected employee/date, pick matching flex options
    const flexRecords = flexDateData?.data?.ResultOnDb
    if (Array.isArray(flexRecords) && flexRecords.length > 0) {
      const desc = flexRecords[0]?.FLEX_TIME_DESCRIPTION || ''
      if (desc === '07.30-16.30') return oneDayTimeLeaveArrWithFlexTimeTypeFaster
      return oneDayTimeLeaveArrWithFlexTimeTypeSlower
    }

    return oneDayTimeLeaveArr
  }

  // Translation helper
  const { t } = useTranslation()

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles)
    }
  })

  const handleRemoveFile = (file: File) => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter((i: File) => i.name !== file.name)
    setFiles([...filtered])
  }

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  // ฟังก์ชันตรวจสอบ AE/L (Annual Emergency Leave)
  const checkIsAELRequest = (): boolean => {
    const alRemain = getRemainDay(LEAVE_TYPE_IDS.ANNUAL_LEAVE)
    const aelRemain = getRemainDay(LEAVE_TYPE_IDS.ANNUAL_LEAVE_EMERGENCY)
    const totalDayLeave = parseFloat(getValues('requestLeaveForm.TOTAL_DAY_LEAVE') || '0')

    // ถ้าไม่มีวันลา AL เหลือ
    if (alRemain === 0) {
      return false
    }
    // ถ้าจำนวนวันลามากกว่าวันลา AL ที่เหลือ
    if (totalDayLeave > alRemain) {
      return false
    }
    // ถ้ามีสิทธิ์ AEL และมี AL เหลือ
    if (aelRemain >= 0 && alRemain > 0) {
      return true
    }
    return false
  }

  // ฟังก์ชันเมื่อ Submit สำเร็จ (Validation ผ่าน) - เปิด Confirm Modal
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setConfirmModal(true) // เปิด confirm modal
  }

  // ฟังก์ชัน Submit จริงหลังจาก Confirm แล้ว
  const handleConfirmSubmit = async () => {
    // ใช้ getValues() ตรงๆ แทนการเก็บใน state
    const requestLeaveForm = getValues('requestLeaveForm')

    try {
      // Validate required fields
      if (!requestLeaveForm.LEAVE_TYPE || !requestLeaveForm.LEAVE_TIME) {
        setConfirmModal(false)
        setResultModal({
          open: true,
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          title: 'ข้อมูลไม่ครบ',
          type: 'error'
        })
        return
      }

      const leaveTypeId = requestLeaveForm.LEAVE_TYPE.LEAVE_TYPE_ID

      // ตรวจสอบ AE/L Request
      if (leaveTypeId === LEAVE_TYPE_IDS.ANNUAL_LEAVE_EMERGENCY) {
        const canRequestAEL = checkIsAELRequest()
        if (!canRequestAEL) {
          setConfirmModal(false)
          setResultModal({
            open: true,
            message: 'ไม่สามารถลา AE/L ได้ เนื่องจากวันลา AL ของพนักงานไม่พอ',
            title: 'คำเตือน',
            type: 'warning'
          })
          return
        }
      }

      // Step 1 สร้าง dataItem สำหรับส่ง API HR Form
      const dataItem = {
        LEAVE_TYPE: leaveTypeId,
        START_DATE: requestLeaveForm.START_DATE,
        END_DATE: requestLeaveForm.END_DATE,
        LEAVE_TIME: requestLeaveForm.LEAVE_TIME.value,
        TOTAL_DAY_LEAVE: requestLeaveForm.TOTAL_DAY_LEAVE,
        REASON: requestLeaveForm.REASON || '',
        REMARK: requestLeaveForm.REMARK || '',
        EMPLOYEE_CODE: String(requestLeaveForm.EMPLOYEE_CODE?.EMPLOYEE_CODE || ''),
        EMPLOYEE_POSITION: String(requestLeaveForm.EMPLOYEE_CODE?.POSITION_NAME || ''),
        EMPLOYEE_DEPARTMENT: String(requestLeaveForm.EMPLOYEE_CODE?.DEPARTMENT_NAME || ''),
        IS_EMPLOYEE_FORM: false, // HR Form
        LEAVE_REQUEST_EMPLOYEE_TELEPHONE: String(requestLeaveForm.EMPLOYEE_CODE?.TELEPHONE || '')
      }

      // ส่ง API สร้าง Leave Request
      const response = await createLeaveRequest(dataItem)

      const createLeaveId = (response?.data?.ResultOnDb as any)?.LEAVE_REQUEST_ID

      // ตรวจสอบผลลัพธ์
      if (response.data && response.data.Status === true) {
        // Step 2 อัพโหลดไฟล์แยก (ถ้ามี)
        if (files.length > 0 && files[0]) {
          const fileFormData = new FormData()
          fileFormData.append('LEAVE_REQUEST_ID', createLeaveId || '')
          fileFormData.append('LEAVE_REQUEST_FILE_UPLOAD_ID', String(Date.now()))
          fileFormData.append('FILE_UPLOAD', files[0])
          fileFormData.append('EMPLOYEE_CODE', requestLeaveForm.EMPLOYEE_CODE?.EMPLOYEE_CODE || '')

          await uploadLeaveFile(fileFormData)
        }

        // แสดง Modal สำเร็จ
        setConfirmModal(false)
        setResultModal({
          open: true,
          message: response.data.Message || 'บันทึกคำขอลาสำเร็จ',
          title: 'สำเร็จ!',
          type: 'success'
        })

        // Invalidate queries เพื่อ refresh ข้อมูล
        queryClient.invalidateQueries({ queryKey: ['EMPLOYEE_LEAVE_BALANCE'] })
        queryClient.invalidateQueries({ queryKey: [LEAVE_REQUEST_KEY] })
        queryClient.invalidateQueries({ queryKey: ['LEAVE_HISTORY'] })

        // Reset form
        handleClear()
      } else {
        // แสดง Modal error
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
    }
  }

  const onError: SubmitErrorHandler<FormDataPage> = errors => {}

  const handleClear = () => {
    reset()
    setFiles([])
  }

  return (
    <>
      <Card>
        <CardHeader title={t('Request Leave Form')} />
        <CardContent>
          <Grid container spacing={5}>
            {/* -------------  Employee Code  ---------------- */}
            <Grid item md={6} sm={12}>
              <Controller
                name='requestLeaveForm.EMPLOYEE_CODE'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <AsyncSelectCustom
                      {...field}
                      label={t('Employee Code')}
                      placeholder={t('Select Employee Code')}
                      defaultOptions
                      loadOptions={async (inputValue: string) => {
                        const response = await fetchAllEmployee({ EMPLOYEE_ID: inputValue })
                        return response as any
                      }}
                      getOptionLabel={(data: any) => `${data.EMPLOYEE_CODE}`}
                      getOptionValue={(data: any) => data.EMPLOYEE_CODE}
                      classNamePrefix='select'
                    />
                    <FormHelperText error={!!error}>{error?.message}</FormHelperText>
                  </>
                )}
              />
            </Grid>
            {/* -------------  Leave Type  ---------------- */}
            <Grid item md={6} sm={12}>
              <Controller
                name='requestLeaveForm.LEAVE_TYPE'
                control={control}
                render={({ field: { ref, ...fieldProps }, fieldState: { error } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={async () => {
                      const result = await fetchLeaveTypeAll()
                      return result as any
                    }}
                    //Filter
                    getOptionValue={data => data?.LEAVE_TYPE_ID?.toString() || ''}
                    getOptionLabel={data =>
                      `${data?.LEAVE_TYPE_DESCRIPTION_EN} / ${data?.LEAVE_TYPE_DESCRIPTION_TH}` || ''
                    }
                    formatOptionLabel={data => (
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

            {/* -------------  Start Date & End Date  ---------------- */}
            <Grid item xs={12} md={6}>
              <Controller
                name='requestLeaveForm.START_DATE'
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <AppReactDatepicker
                    selected={value ? new Date(value) : null}
                    onChange={(date: Date | null) => {
                      onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)
                      if (date) setValue('requestLeaveForm.END_DATE', dayjs(date).format('YYYY-MM-DD'))
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
                        helperText={error?.message}
                        InputProps={{ readOnly: true }}
                      />
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='requestLeaveForm.END_DATE'
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
                        InputProps={{ readOnly: true }}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* -------------  Time & Total Day Leave  ---------------- */}
            <Grid item xs={12} md={6}>
              <Controller
                name='requestLeaveForm.LEAVE_TIME'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <AsyncSelectCustom
                    {...field}
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
            <Grid item xs={12} md={6}>
              <Controller
                name='requestLeaveForm.TOTAL_DAY_LEAVE'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    {...field}
                    label={t('Total Day Leave')}
                    fullWidth
                    disabled
                    placeholder='0'
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/* -------------  Reason & Remark  ---------------- */}
            <Grid item xs={12} md={6}>
              <Controller
                name='requestLeaveForm.REASON'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    {...field}
                    label={t('Reason (Optional)')}
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='requestLeaveForm.REMARK'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    {...field}
                    label={t('Remark (Optional)')}
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/* -------------  Attachment  ---------------- */}
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ mb: 2 }}>
                {`${t('Leave Attachment')} (${t('Optional')})`}
              </Typography>
              <Controller
                name='requestLeaveForm.FILE_UPLOAD'
                control={control}
                render={({ field: { onChange } }) => (
                  <>
                    {files.length === 0 ? (
                      // Show dropzone when no files uploaded
                      <Card
                        {...getRootProps()}
                        sx={{
                          border: '2px dashed',
                          borderColor: isDragActive ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          p: 3,
                          textAlign: 'center',
                          cursor: 'pointer',
                          bgcolor: isDragActive ? 'action.selected' : 'action.hover',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.selected'
                          }
                        }}
                      >
                        <input
                          {...getInputProps({
                            onChange: e => {
                              const selectedFiles = e.target.files
                              if (selectedFiles) {
                                const fileArray = Array.from(selectedFiles)
                                setFiles(fileArray)
                                onChange(selectedFiles)
                              }
                            }
                          })}
                        />
                        <div className='flex items-center flex-col'>
                          <Avatar
                            variant='rounded'
                            sx={{
                              bgcolor: 'primary.main',
                              width: 35,
                              height: 35,
                              mb: 2,
                              border: '2px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <CloudUploadIcon sx={{ color: 'white' }} />
                          </Avatar>
                          <Typography variant='h6' sx={{ mb: 1 }}>
                            {isDragActive ? t('Drop file here') : t('Drag & drop file here, or click to select')}
                          </Typography>
                          <Typography color='text.secondary'>
                            {t('Supported: Max')}{' '}
                            <Typography component='span' color='primary' sx={{ cursor: 'pointer' }}>
                              {t('5 MB')}
                            </Typography>{' '}
                            {t('per file.')}
                          </Typography>
                        </div>
                      </Card>
                    ) : (
                      // Show uploaded file when file exists
                      <Card
                        sx={{
                          borderRadius: 2,
                          p: 3,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant='subtitle1' fontWeight={600}>
                            {t('Uploaded File')}
                          </Typography>
                          <Chip
                            label={`${files.length} ${files.length === 1 ? 'file' : 'files'}`}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        </Box>
                        <List disablePadding>
                          {files.map((file: File) => (
                            <ListItem
                              key={file.name}
                              sx={{
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                mb: 1,
                                '&:last-child': { mb: 0 }
                              }}
                              secondaryAction={
                                <IconButton
                                  edge='end'
                                  color='error'
                                  onClick={() => handleRemoveFile(file)}
                                  size='small'
                                >
                                  <i className='tabler-x text-xl' />
                                </IconButton>
                              }
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <Avatar
                                  variant='rounded'
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: file.type?.startsWith('image') ? 'info.lighter' : 'warning.lighter'
                                  }}
                                >
                                  {file.type?.startsWith('image') ? (
                                    <img
                                      alt={file.name}
                                      src={URL.createObjectURL(file as unknown as Blob)}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                    />
                                  ) : (
                                    <i className='tabler-file-description text-xl' />
                                  )}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={file.name}
                                secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Card>
                    )}
                  </>
                )}
              />
            </Grid>

            {/* -------------  Buttons ---------------- */}
            <Grid item sx={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              <Button variant='contained' type='button' onClick={handleSubmit(onSubmit, onError)} disabled={isPending}>
                {isPending ? 'กำลังบันทึก...' : t('Submit')}
              </Button>
              <Button variant='tonal' color='secondary' type='button' onClick={handleClear} disabled={isPending}>
                {t('Clear')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Confirm Modal */}
      <LeaveRequestConfirmModal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        isLoading={isPending}
      />
      {/* Result Modal (Success/Warning/Error) */}
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

export default RequestLeaveFormHr
