// React Imports
import { useEffect, useMemo, useState } from 'react'

// Translation
import { useTranslation } from '@/contexts/TranslationContext'

// MUI Imports
import {
  Divider,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Avatar,
  IconButton,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Tooltip
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

// React Hook Form Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

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
  getRemainDayByLeaveType,
  getUsedDayByLeaveType
} from '@/_workspace/react-query/hooks/useLeaveEmployeeBalance'
import {
  useCreateLeaveRequest,
  PREFIX_QUERY_KEY as LEAVE_REQUEST_KEY
} from '@/_workspace/react-query/hooks/useLeaveRequestCreate'
import { useUploadLeaveFile } from '@/_workspace/react-query/hooks/useLeaveFile'

// Components Imports
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SkeletonCustom from '@/components/SkeletonCustom'
import CustomTextField from '@/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import LeaveRequestConfirmModal from './modal/LeaveRequestConfirmModal'
import LeaveRequestSuccessModal, { MessageType } from './modal/LeaveRequestSuccessModal'

// Types, Utils & Options Imports
import { FormDataPage } from './validationSchema'
import { getImgLeaveType } from '../leave-history/leave-history-function/ImgLeaveType'
import { fetchLeaveType } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveType'
import { LEAVE_TYPE_IDS } from '@/_workspace/types/leave-employee-balance/LeaveEmployeeBalanceInterface'
import { FileProp } from '@/_workspace/types/leave-file-prop/LeaveFilePropInterface'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import {
  oneDayTimeLeaveArr,
  multipleDayTimeLeaveArr,
  timeLeaveArrM2L,
  timeLeaveArrWFH,
  TimeLeaveOption
} from './timeLeaveOptions'
import { oneDayTimeLeaveArrWithFlexTimeTypeFaster, oneDayTimeLeaveArrWithFlexTimeTypeSlower } from './timeLeaveOptions'
import { useSearchFlexTimeBySpecificDate } from '@/_workspace/react-query/hooks/useFlexTime'

function LeaveRequestForm() {
  // States - UI only (modals)
  const [resultModal, setResultModal] = useState({
    open: false,
    message: '',
    title: '',
    type: 'success' as MessageType
  })
  const [confirmModal, setConfirmModal] = useState(false)

  // React Query Client
  const queryClient = useQueryClient()

  // Hooks
  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch, reset } = useFormContext<FormDataPage>()

  // Watch values for time leave options
  const watchLeaveType = watch('searchFilters.leaveType')
  const watchStartDate = watch('searchFilters.startDate')
  const watchEndDate = watch('searchFilters.endDate')
  const watchTimeLeave = watch('searchFilters.timeLeave')
  // console.log(watchTimeLeave);
  // คำนวณว่าลาหลายวันหรือไม่ (derived state with useMemo)
  const isMoreOneDay = useMemo(() => {
    if (!watchStartDate || !watchEndDate) return false
    const start = dayjs(watchStartDate)
    const end = dayjs(watchEndDate)
    return end.diff(start, 'day') > 0
  }, [watchStartDate, watchEndDate])

  // ฟังก์ชันคำนวณจำนวนวันลาจาก timeLeave label
  const getDayFromTimeLeave = (timeLeaveValue: string | undefined): number => {
    if (!timeLeaveValue) return 0

    // ดึงจำนวนวันจาก label เช่น "08.30 น. - 12.30 น. (0.5 วัน)" → 0.5
    const match = timeLeaveValue.match(/\((\d+\.?\d*)\s*วัน\)/)
    if (match) {
      return parseFloat(match[1])
    }

    // fallback: ถ้าไม่มี pattern ให้ดูจาก value
    if (timeLeaveValue.includes('0.5') || timeLeaveValue.includes('0.25')) {
      return 0.5
    }
    return 1
  }

  // ฟังก์ชันตรวจสอบว่าวันนั้นเป็นวันหยุด
  const isHoliday = (date: dayjs.Dayjs, holidays: Date[]): boolean => {
    // ตรวจสอบวันเสาร์ (6) หรือ วันอาทิตย์ (0)
    // const dayOfWeek = date.day()
    // if (dayOfWeek === 0 || dayOfWeek === 6) {
    //   return true
    // }

    // ตรวจสอบวันหยุดบริษัท
    const dateStr = date.format('YYYY-MM-DD')
    const isCompanyHoliday = holidays.some(holiday => dayjs(holiday).format('YYYY-MM-DD') === dateStr)

    return isCompanyHoliday
  }

  // นับจำนวนวันทำงาน (ไม่รวมเสาร์-อาทิตย์ และวันหยุดบริษัท)
  const countWorkingDays = (startDate: string, endDate: string, holidays: Date[]): number => {
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    let workingDays = 0

    let current = start
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      if (!isHoliday(current, holidays)) {
        workingDays++
      }
      current = current.add(1, 'day')
    }

    return workingDays
  }

  // คำนวณ Total Day Leave (นับเฉพาะวันทำงาน)
  const calculateTotalDayLeave = (): string => {
    if (!watchStartDate || !watchEndDate || !watchTimeLeave) {
      return '0'
    }

    // นับจำนวนวันทำงาน (ไม่รวมวันหยุด)
    const workingDays = countWorkingDays(watchStartDate, watchEndDate, companyHolidays)

    // ถ้าไม่มีวันทำงานเลย
    if (workingDays === 0) {
      return '0'
    }

    // ดึงจำนวนวันจาก timeLeave
    const dayFromTime = getDayFromTimeLeave(watchTimeLeave?.label)

    // ถ้าลาหลายวันทำงาน
    if (workingDays > 1) {
      // ถ้าเลือก Full Day → คูณจำนวนวันทำงาน
      if (dayFromTime === 1) {
        return workingDays.toString()
      }
      // ถ้าเลือก Half Day → ไม่ควรเกิดกรณีนี้เพราะลาหลายวันจะแสดงแค่ Full Day
      return workingDays.toString()
    }

    // ลาวันเดียว → ใช้ค่าจาก timeLeave
    return dayFromTime.toString()
  }

  // useEffect สำหรับอัพเดท Total Day Leave
  useEffect(() => {
    const total = calculateTotalDayLeave()
    setValue('searchFilters.total', total)
  }, [watchStartDate, watchEndDate, watchTimeLeave, setValue])

  // ฟังก์ชันเลือก options ตามเงื่อนไข
  // Flex Time API - ตรวจสอบว่าวันที่เลือกมี Flex Time หรือไม่
  const { data: flexTimeData } = useSearchFlexTimeBySpecificDate(
    {
      EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || '',
      START_DATE: watchStartDate ? dayjs(watchStartDate).format('YYYY-MM-DD') : '',
      END_DATE: watchEndDate ? dayjs(watchEndDate).format('YYYY-MM-DD') : ''
    },
    !!watchStartDate && !isMoreOneDay
  )

  // ดึงข้อมูล Flex Time จาก API response
  const flexTimeResult = flexTimeData?.data?.ResultOnDb as any[]
  const hasFlexTime = flexTimeResult && Array.isArray(flexTimeResult) && flexTimeResult.length > 0
  const flexTimeType = hasFlexTime ? flexTimeResult[0]?.FLEX_TIME_TYPE : null

  const getTimeLeaveOptions = (): TimeLeaveOption[] => {
    const leaveTypeId = watchLeaveType?.LEAVE_TYPE_ID

    // M2L
    if (leaveTypeId === 6) {
      return timeLeaveArrM2L
    }

    // WFH
    if (leaveTypeId === 11) {
      return timeLeaveArrWFH
    }

    // ลาหลายวัน
    if (isMoreOneDay) {
      return multipleDayTimeLeaveArr
    }

    // Leave Type พิเศษที่ต้องใช้ multipleDayTimeLeaveArr (17, 18, 20)
    if (leaveTypeId && [17, 18, 20].includes(leaveTypeId)) {
      return multipleDayTimeLeaveArr
    }

    // ตรวจสอบ Flex Time และแสดง options ที่เหมาะสม
    if (hasFlexTime && flexTimeType) {
      // Flex Time แบบเช้า (07.30-16.30)
      if (flexTimeType === '07.30-16.30') {
        return oneDayTimeLeaveArrWithFlexTimeTypeFaster
      }
      // Flex Time แบบอื่นๆ เช่น 09.30-18.30
      return oneDayTimeLeaveArrWithFlexTimeTypeSlower
    }

    return oneDayTimeLeaveArr
  }

  const { data: leaveTypeMaxDayData } = useLeaveTypeMaxDay()
  const { data: holidayCompanyData } = useLeaveHolidayCompany({}, true)

  const employeeCode = getUserData()?.EMPLOYEE_CODE || ''
  const { data: leaveBalanceData, isLoading: isLoadingLeaveBalance } = useLeaveEmployeeBalance(
    { EMPLOYEE_CODE: employeeCode },
    !!employeeCode
  )

  const getRemainDay = (leaveTypeId: number) => getRemainDayByLeaveType(leaveBalanceData, leaveTypeId)
  const getUsedDay = (leaveTypeId: number) => getUsedDayByLeaveType(leaveBalanceData, leaveTypeId)
  const employeeStartWork = leaveBalanceData?.data?.ResultOnDb?.[0]?.EMPLOYEE_START_WORK || ''
  const isPassPro = leaveBalanceData?.data?.ResultOnDb?.[0]?.IS_PASS_PRO ?? true

  const getExperienceActual = (): string => {
    if (!employeeStartWork) return '-'

    const startDate = dayjs(employeeStartWork)
    const now = dayjs()

    const years = now.diff(startDate, 'year')
    const months = now.diff(startDate.add(years, 'year'), 'month')
    const days = now.diff(startDate.add(years, 'year').add(months, 'month'), 'day')

    return `${years} ${t('Years')} ${months} ${t('Months')} ${days} ${t('Days')}`
  }

  const getExperienceAdjust = (): string => {
    if (!employeeStartWork) return '-'

    const startDate = dayjs(employeeStartWork)
    const now = dayjs()

    const totalMonths = now.diff(startDate, 'month')
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    const adjustedYears = months > 0 ? years + 1 : years

    return `${adjustedYears} ${t('Years')}`
  }

  const getReceivedDay = (): string => {
    if (!employeeStartWork) return '-'
    if (!isPassPro) return `0 ${t('Days')}`

    const startDate = dayjs(employeeStartWork)
    const now = dayjs()

    const totalMonths = now.diff(startDate, 'month')
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    const experience = months > 0 ? years + 1 : years

    let receivedDays = 0
    switch (experience) {
      case 0:
        receivedDays = 6
        break
      case 1:
        receivedDays = 7
        break
      case 2:
        receivedDays = 8
        break
      case 3:
        receivedDays = 9
        break
      case 4:
        receivedDays = 10
        break
      case 5:
        receivedDays = 11
        break
      case 6:
        receivedDays = 12
        break
      default:
        receivedDays = experience > 6 ? 13 : 0
        break
    }

    return `${receivedDays} ${t('Days')}`
  }

  const businessLeaveMaxDay =
    leaveTypeMaxDayData?.data?.ResultOnDb?.find(item => item.LEAVE_TYPE_ID === LEAVE_TYPE_IDS.BUSINESS_LEAVE)
      ?.LEAVE_TYPE_MAX_DAY || '5'
  const sickLeaveMaxDay =
    leaveTypeMaxDayData?.data?.ResultOnDb?.find(item => item.LEAVE_TYPE_ID === LEAVE_TYPE_IDS.SICK_LEAVE)
      ?.LEAVE_TYPE_MAX_DAY || '30'

  const companyHolidays: Date[] =
    holidayCompanyData?.data?.ResultOnDb?.map(holiday => new Date(holiday.day_holiday)) || []

  const getMaxDayByLeaveTypeId = (leaveTypeId: number): number => {
    const found = leaveTypeMaxDayData?.data?.ResultOnDb?.find(item => item.LEAVE_TYPE_ID === leaveTypeId)
    return found ? parseFloat(found.LEAVE_TYPE_MAX_DAY) : 0
  }

  const currentMaxDay = watchLeaveType?.LEAVE_TYPE_ID ? getMaxDayByLeaveTypeId(watchLeaveType.LEAVE_TYPE_ID) : 0

  const getMaxEndDate = (): Date | undefined => {
    if (!watchStartDate || !currentMaxDay || currentMaxDay <= 0) return undefined

    let workingDaysCount = 0
    let currentDate = dayjs(watchStartDate)

    while (workingDaysCount < currentMaxDay) {
      if (!isHoliday(currentDate, companyHolidays)) {
        workingDaysCount++
      }

      if (workingDaysCount < currentMaxDay) {
        currentDate = currentDate.add(1, 'day')
      }
    }

    return currentDate.toDate()
  }

  useEffect(() => {
    if (watchLeaveType) {
      setValue('searchFilters.endDate', null as any)
      setValue('searchFilters.timeLeave', null as any)
    }
  }, [watchLeaveType?.LEAVE_TYPE_ID])

  useEffect(() => {
    if (watchStartDate && watchEndDate && currentMaxDay > 0) {
      const maxEndDate = getMaxEndDate()
      if (maxEndDate && dayjs(watchEndDate).isAfter(dayjs(maxEndDate))) {
        setValue('searchFilters.endDate', null as any)
      }
    }
  }, [watchStartDate])

  const { mutateAsync: createLeaveRequest, isPending } = useCreateLeaveRequest()
  const { mutateAsync: uploadLeaveFile } = useUploadLeaveFile()

  const checkIsAELRequest = (): boolean => {
    const alRemain = getRemainDay(LEAVE_TYPE_IDS.ANNUAL_LEAVE)
    const aelRemain = getRemainDay(LEAVE_TYPE_IDS.ANNUAL_LEAVE_EMERGENCY)
    const totalDayLeave = parseFloat(getValues('searchFilters.total') || '0')

    if (alRemain === 0) {
      return false
    }
    if (totalDayLeave > alRemain) {
      return false
    }
    if (aelRemain >= 0 && alRemain > 0) {
      return true
    }
    return false
  }

  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    const searchFilters = getValues('searchFilters')

    try {
      const leaveTypeId = searchFilters.leaveType.LEAVE_TYPE_ID

      if (leaveTypeId === LEAVE_TYPE_IDS.ANNUAL_LEAVE_EMERGENCY) {
        const canRequestAEL = checkIsAELRequest()
        if (!canRequestAEL) {
          setConfirmModal(false)
          setResultModal({
            open: true,
            message: 'ไม่สามารถลา AE/L ได้ เนื่องจากวันลา AL ของคุณไม่พอ',
            title: 'คำเตือน',
            type: 'warning'
          })
          return
        }
      }

      const dataItem = {
        LEAVE_TYPE: leaveTypeId,
        START_DATE: searchFilters.startDate,
        END_DATE: searchFilters.endDate,
        LEAVE_TIME: searchFilters.timeLeave.value,
        TOTAL_DAY_LEAVE: searchFilters.total,
        REASON: searchFilters.reason || '',
        REMARK: searchFilters.remark || '',
        EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || '',
        EMPLOYEE_POSITION: getUserData()?.POSITION_NAME || '',
        EMPLOYEE_DEPARTMENT: getUserData()?.DEPARTMENT_NAME || '',
        IS_EMPLOYEE_FORM: true,
        LEAVE_REQUEST_EMPLOYEE_TELEPHONE: searchFilters.tel || ''
      }

      // ส่ง API สร้าง Leave Request
      const response = await createLeaveRequest(dataItem)

      const createLeaveId = (response?.data?.ResultOnDb as any)?.LEAVE_REQUEST_ID
      // console.log(createLeaveId,'forfile');
      // ตรวจสอบผลลัพธ์
      if (response.data && response.data.Status === true) {
        // Step 2: อัพโหลดไฟล์แยก (ถ้ามี)
        if (files.length > 0 && files[0]) {
          const fileFormData = new FormData()
          fileFormData.append('LEAVE_REQUEST_ID', createLeaveId || '')
          fileFormData.append('LEAVE_REQUEST_FILE_UPLOAD_ID', String(Date.now()))
          fileFormData.append('FILE_UPLOAD', files[0])
          fileFormData.append('EMPLOYEE_CODE', getUserData()?.EMPLOYEE_CODE || '')

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

  // ฟังก์ชันเมื่อ Validation ไม่ผ่าน
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('=== Form Validation Errors ===')
    console.log('Errors:', errors)
    console.log('=== End Errors ===')
  }

  // Clear Form ทั้งหมด
  const handleClear = () => {
    reset({
      searchFilters: {
        leaveType: null as any,
        startDate: null as any,
        endDate: null as any,
        timeLeave: null as any,
        total: '0',
        reason: '',
        remark: '',
        fileUpload: null as any
      }
    })
    // files จะถูก reset พร้อม form ผ่าน fileUpload field และ state
    setFiles([])
  }

  // Translation
  const { t } = useTranslation()

  // States
  const [files, setFiles] = useState<File[]>([])

  // Hooks
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)))
    }
  })

  const handleRemoveFile = (file: FileProp) => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name)
    setFiles([...filtered])
  }

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  return (
    <>
      <Card style={{ overflow: 'visible', zIndex: 4 }}>
        <CardHeader
          title={t('Request Leave Form')}
          titleTypographyProps={{ variant: 'h5' }}
          sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
        />
        <CardContent>
          {isLoadingLeaveBalance ? (
            <>
              <SkeletonCustom />
            </>
          ) : (
            <>
              <Grid container spacing={{ xs: 4, md: 8 }} sx={{ mb: 4 }}>
                <Grid item xs={12} md={5} sm={12}>
                  <Card sx={{ height: '100%', border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 4, md: 8 }, '&:last-child': { pb: { xs: 4, md: 8 } } }}>
                      <Grid container spacing={2} alignItems='center'>
                        <Grid item xs={12}>
                          <Grid container spacing={{ xs: 3, md: 5 }}>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant='h5'
                                color='primary'
                                fontWeight='bold'
                                sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                              >
                                {getRemainDay(LEAVE_TYPE_IDS.ANNUAL_LEAVE)} {t('Days')}
                              </Typography>
                              <Typography variant='body2' color='textSecondary' display='block' sx={{ mt: 1 }}>
                                {t('Available Annual Leave')}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant='h5'
                                fontWeight='bold'
                                sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '1rem', md: '1.25rem' } }}
                              >
                                {getRemainDay(LEAVE_TYPE_IDS.ANNUAL_LEAVE_ACCUMULATE)} {t('Days')}
                                <Tooltip
                                  title={t('Available Annual Leave (from Previous Year)')}
                                  slotProps={{
                                    tooltip: {
                                      sx: {
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        boxShadow: 6,
                                        borderRadius: 2,
                                        maxWidth: 450,
                                        '& .MuiTooltip-arrow': {
                                          color: 'background.paper'
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <InfoIcon
                                    fontSize='small'
                                    sx={{ ml: 0.5, color: 'text.secondary', cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              </Typography>
                              <Typography variant='body2' color='textSecondary' display='block' sx={{ mt: 1 }}>
                                {t('Annual Leave Accumulate')}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant='h5'
                                fontWeight='bold'
                                sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '1rem', md: '1.25rem' } }}
                              >
                                {getReceivedDay()}
                                <Tooltip
                                  title={
                                    <Box sx={{ minWidth: 380, p: 1 }}>
                                      <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 2 }}>
                                        {t('Annual Leave Received')}
                                      </Typography>
                                      <Table size='small'>
                                        <TableHead>
                                          <TableRow
                                            sx={{
                                              '& th': { borderBottom: '1px solid', borderColor: 'divider', py: 1 }
                                            }}
                                          >
                                            <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                                              {t('Exp Actual')}
                                            </TableCell>
                                            <TableCell
                                              align='center'
                                              sx={{ color: 'text.primary', fontWeight: 'bold' }}
                                            >
                                              {t('Day')}
                                            </TableCell>
                                            <TableCell
                                              align='center'
                                              sx={{ color: 'text.primary', fontWeight: 'bold' }}
                                            >
                                              {t('Exp Adjust')}
                                            </TableCell>
                                            <TableCell align='right' sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                                              {t('Received Day')}
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          <TableRow sx={{ '& td': { border: 0, py: 1 } }}>
                                            <TableCell sx={{ color: 'text.secondary' }}>
                                              {getExperienceActual()}
                                            </TableCell>
                                            <TableCell align='center' sx={{ color: 'text.secondary' }}>
                                              {getRemainDay(LEAVE_TYPE_IDS.RECEIVED_DAY)} {t('Days')}
                                            </TableCell>
                                            <TableCell align='center' sx={{ color: 'text.secondary' }}>
                                              {getExperienceAdjust()}
                                            </TableCell>
                                            <TableCell align='right'>
                                              <Chip
                                                label={getReceivedDay()}
                                                color='primary'
                                                size='small'
                                                sx={{ fontWeight: 'bold' }}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </Box>
                                  }
                                  slotProps={{
                                    tooltip: {
                                      sx: {
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        boxShadow: 6,
                                        borderRadius: 2,
                                        maxWidth: 550,
                                        '& .MuiTooltip-arrow': {
                                          color: 'background.paper'
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <InfoIcon
                                    fontSize='small'
                                    sx={{ ml: 0.5, color: 'text.secondary', cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              </Typography>
                              <Typography variant='body2' color='textSecondary' display='block' sx={{ mt: 1 }}>
                                {t('The proportion of annual leave')}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={5} sm={12}>
                  <Card sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 4, md: 8 }, '&:last-child': { pb: { xs: 4, md: 8 } } }}>
                      <Grid container spacing={2} alignItems='center'>
                        <Grid item xs={12}>
                          <Grid container spacing={{ xs: 3, md: 5 }}>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant='h5'
                                fontWeight='bold'
                                sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                              >
                                {getRemainDay(LEAVE_TYPE_IDS.ANNUAL_LEAVE_EMERGENCY)} {t('Times')}
                              </Typography>
                              <Typography variant='body2' color='textSecondary' display='block' sx={{ mt: 1 }}>
                                {t('Annual Leave Emergency Remaining')}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant='h5'
                                fontWeight='bold'
                                sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                              >
                                {getRemainDay(LEAVE_TYPE_IDS.BUSINESS_LEAVE)} / {businessLeaveMaxDay} {t('Days')}
                                {getRemainDay(LEAVE_TYPE_IDS.BUSINESS_LEAVE) < 0 && (
                                  <Typography
                                    component='span'
                                    color='error'
                                    sx={{ fontSize: '0.75rem', display: 'block' }}
                                  >
                                    {t('You are borrowing business leave next year.')}
                                  </Typography>
                                )}
                              </Typography>
                              <Typography variant='body2' color='textSecondary' display='block' sx={{ mt: 1 }}>
                                {t('Business Leave Remaining')}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant='h5'
                                fontWeight='bold'
                                sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                              >
                                {getUsedDay(LEAVE_TYPE_IDS.OTHER_LEAVE)} {t('Days')}
                              </Typography>
                              <Typography variant='body2' color='textSecondary' display='block' sx={{ mt: 1 }}>
                                {t('Other Leave Used')}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={2} sm={12}>
                  <Card
                    sx={{ height: '100%', border: '1px solid #e0e0e0', bgcolor: 'warning.lighter', borderRadius: 2 }}
                  >
                    <CardContent sx={{ p: { xs: 4, md: 8 }, '&:last-child': { pb: { xs: 4, md: 8 } } }}>
                      <Grid container spacing={5} alignItems='center'>
                        <Grid item xs={12}>
                          <Typography variant='h5' fontWeight='bold' sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                            {getUsedDay(LEAVE_TYPE_IDS.SICK_LEAVE)} / {sickLeaveMaxDay} {t('Days')}
                            {getUsedDay(LEAVE_TYPE_IDS.SICK_LEAVE) > 30 && (
                              <Typography component='span' color='error' sx={{ fontSize: '0.75rem', ml: 0.5 }}>
                                {t('Already exceed 30 days')}
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant='body2' color='textSecondary' display='block' sx={{ mt: 1 }}>
                            {t('Sick Leave Used')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Divider sx={{ my: 6 }} />
              <Grid container spacing={4}>
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
                          const result = await fetchLeaveType({ EMPLOYEE_CODE: getUserData()?.EMPLOYEE_CODE || '' })
                          return result as any
                        }}
                        //Filter
                        getOptionValue={data => data?.LEAVE_TYPE_ID?.toString() || ''}
                        getOptionLabel={data =>
                          `${data?.LEAVE_TYPE_DESCRIPTION_EN} / ${data?.LEAVE_TYPE_DESCRIPTION_TH}` || ''
                        }
                        formatOptionLabel={data => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* เรียกใช้ฟังก์ชัน getImgLeaveType โดยส่ง ID เข้าไป */}
                            <div>{getImgLeaveType(Number(data.LEAVE_TYPE_ID))}</div>
                            {/* แสดงข้อความ */}
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
                <Grid item xs={12} md={6}>
                  {watchLeaveType?.LEAVE_TYPE_ID === LEAVE_TYPE_IDS.FUNERAL_LEAVE && (
                    <Controller
                      name='searchFilters.tel'
                      control={control}
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <CustomTextField
                          fullWidth
                          rows={3}
                          label={`${t('Telephone')}`}
                          value={value}
                          onChange={onChange}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name='searchFilters.startDate'
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                      <AppReactDatepicker
                        selected={value ? new Date(value) : null}
                        onChange={(date: Date | null) => {
                          onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)
                          setValue('searchFilters.endDate', dayjs(date).format('YYYY-MM-DD'))
                        }}
                        placeholderText={t('Select Date')}
                        disabled={!watchLeaveType}
                        minDate={new Date()}
                        excludeDates={companyHolidays}
                        highlightDates={companyHolidays}
                        autoComplete='off'
                        customInput={
                          <CustomTextField
                            label={`${t('Start Date')}${currentMaxDay > 0 ? ` (ลาได้สูงสุด ${currentMaxDay} วัน)` : ''}`}
                            fullWidth
                            error={!!error}
                            helperText={error?.message || (!watchLeaveType ? t('Please Select Leave Type First') : '')}
                          />
                        }
                        // onChange={(value) => {
                        //   onChange(value)
                        //   if (value === null) {
                        //     setValue('searchFilters.employeeCode', null)
                        //   } else {
                        //     setValue('searchFilters.employeeCode', { EMPLOYEE_CODE: value.EMPLOYEE_CODE })
                        //     setValue('searchFilters.department', { DEPARTMENT: value.DEPARTMENT })
                        //     setValue('searchFilters.section', { SECTION: value.SECTION })
                        //   }
                        // }}
                      />
                    )}
                  />
                </Grid>
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
                            helperText={error?.message || (!watchStartDate ? t('Please Select Start Date First') : '')}
                          />
                        }
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name='searchFilters.timeLeave'
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
                    name='searchFilters.total'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={t('Total Day Leave')}
                        placeholder='0'
                        InputProps={{ readOnly: true }}
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name='searchFilters.reason'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label={`${t('Reason')} (${t('Optional')})`}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name='searchFilters.remark'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label={`${t('Remark')} (${t('Optional')})`}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='body2' sx={{ mb: 2 }}>
                    {`${t('Leave Attachment')} (${t('Optional')})`}
                  </Typography>
                  <Controller
                    name='searchFilters.fileUpload'
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
                              p: 6,
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
                                  width: 48,
                                  height: 48,
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
                                {t('per file')}
                              </Typography>
                            </div>
                          </Card>
                        ) : (
                          // Show uploaded file(s) when file exists
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
                              {files.map((file: FileProp) => (
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
                            {/* <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                              <Button
                                size='small'
                                color='error'
                                variant='outlined'
                                startIcon={<i className='tabler-trash text-lg' />}
                                onClick={() => {
                                  handleRemoveAllFiles()
                                  onChange(null)
                                }}
                              >
                                {t('Remove')}
                              </Button>
                              <Button
                                size='small'
                                variant='outlined'
                                startIcon={<i className='tabler-refresh text-lg' />}
                                onClick={() => {
                                  handleRemoveAllFiles()
                                  onChange(null)
                                }}
                              >
                                {t('Upload New')}
                              </Button>
                            </Box> */}
                          </Card>
                        )}
                      </>
                    )}
                  />
                </Grid>

                <Grid item xs={12} className='flex gap-4'>
                  <Button variant='contained' type='button' onClick={handleSubmit(onSubmit, onError)}>
                    {t('Submit')}
                  </Button>
                  <Button variant='tonal' color='secondary' type='button' onClick={handleClear}>
                    {t('Clear')}
                  </Button>
                </Grid>
                {/* test */}
              </Grid>
            </>
          )}
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

export default LeaveRequestForm
