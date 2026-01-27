import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Button, Card, CardContent, CardHeader, Grid, CircularProgress, Collapse, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext } from 'react-hook-form'
import dayjs from 'dayjs'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SelectCustom from '@/components/react-select/SelectCustom'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@/components/mui/TextField'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrChecker'
import { FormDataPage } from './validationSchema'
import {
  HR_CHECK_STATUS_OPTIONS_FOR_LEAVE,
  APPROVE_STATUS_OPTIONS
} from '@/_workspace/types/hr-checker/HrCheckerInterface'
import { fetchLeaveType } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveType'
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import { getImgLeaveType } from '../../../assets/leave-type-function/ImgLeaveType'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import { Box } from '@mui/material'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { MENU_ID } from './env'
function HrCheckerSearchFilter() {
  const { setIsEnableFetching } = useDxContext()
  const [isExpanded, setIsExpanded] = useState(true)
  const queryClient = useQueryClient()
  const { control, getValues, setValue, handleSubmit } = useFormContext<FormDataPage>()
  const { t } = useTranslation()
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      startDate: null,
      endDate: null,
      leaveType: null,
      employeeCode: null,
      status: { value: 'notCheck', label: 'ยังไม่ตรวจสอบ / Not-check' },
      approveStatus: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_FOR_EXPORT`] })
    saveUserSettings()
  }
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_FOR_EXPORT`] })
    saveUserSettings()
  }
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }
  const saveUserSettings = () => {
    const currentEmployeeCode = getValues('searchFilters.employeeCode')
    const currentLeaveType = getValues('searchFilters.leaveType')
    const currentStartDate = getValues('searchFilters.startDate')
    const currentEndDate = getValues('searchFilters.endDate')
    const currentStatus = getValues('searchFilters.status')
    const currentApproveStatus = getValues('searchFilters.approveStatus')
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          startDate: currentStartDate,
          endDate: currentEndDate,
          leaveType: currentLeaveType,
          employeeCode: currentEmployeeCode,
          status: currentStatus,
          approveStatus: currentApproveStatus
        },
        searchResults: {
          pageSize: getValues('searchResults.pageSize'),
          columnFilters: getValues('searchResults.columnFilters'),
          sorting: getValues('searchResults.sorting'),
          density: getValues('searchResults.density'),
          columnVisibility: getValues('searchResults.columnVisibility'),
          columnPinning: getValues('searchResults.columnPinning'),
          columnOrder: getValues('searchResults.columnOrder'),
          columnFilterFns: getValues('searchResults.columnFilterFns')
        }
      } as FormDataPage
    }
    mutate(dataItem)
  }
  const onMutateSuccess = () => {}
  const onMutateError = (e: any) => {
    console.error('Save settings error:', e)
  }
  const { mutate, isPending, isError, error } = useCreate(onMutateSuccess, onMutateError)
  return (
    <Card>
      <CardHeader
        title={t('Search filters')}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={isExpanded}>
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={4}>
            {/* Employee Code */}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.employeeCode'
                control={control}
                render={({ field }) => (
                  <AsyncSelectCustom
                    {...field}
                    label={t('Employee Code')}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={async (inputValue: string) => {
                      const result = await fetchAllEmployee({})
                      return result as any
                    }}
                    getOptionLabel={data => data.EMPLOYEE_CODE || ''}
                    getOptionValue={data => data.EMPLOYEE_CODE || ''}
                    placeholder={t('Enter employee code')}
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>
            {/* Leave Type */}
            <Grid item xs={12} md={4}>
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
                    placeholder='Select Leave Type'
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            {/* Start Date */}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.startDate'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AppReactDatepicker
                    autoComplete='off'
                    selected={value ? new Date(value) : null}
                    onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                    placeholderText={t('Choose start date')}
                    dateFormat='YYYY-MM-DD'
                    customInput={
                      <CustomTextField fullWidth label={t('Start Date')} placeholder={t('Choose start date')} />
                    }
                  />
                )}
              />
            </Grid>
            {/* End Date */}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.endDate'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AppReactDatepicker
                    autoComplete='off'
                    selected={value ? new Date(value) : null}
                    onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                    placeholderText={t('Choose end date')}
                    dateFormat='YYYY-MM-DD'
                    minDate={
                      getValues('searchFilters.startDate') ? new Date(getValues('searchFilters.startDate')!) : undefined
                    }
                    customInput={<CustomTextField fullWidth label={t('End Date')} placeholder={t('Choose end date')} />}
                  />
                )}
              />
            </Grid>
            {/* Status */}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.status'
                control={control}
                render={({ field }) => (
                  <SelectCustom
                    {...field}
                    label={t('Status')}
                    options={HR_CHECK_STATUS_OPTIONS_FOR_LEAVE}
                    getOptionLabel={option => option.label}
                    getOptionValue={option => option.value}
                    placeholder={t('Select status')}
                    isClearable={false}
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>
            {/* Approve Status */}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.approveStatus'
                control={control}
                render={({ field }) => (
                  <SelectCustom
                    {...field}
                    label={t('Approve Status')}
                    options={APPROVE_STATUS_OPTIONS}
                    getOptionLabel={option => option.label}
                    getOptionValue={option => option.value}
                    placeholder={t('Select status')}
                    isClearable
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>
            {/* Buttons */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='contained'
                  type='button'
                  onClick={handleSubmit(onSubmit, onError)}
                  disabled={isPending}
                  startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
                >
                  {isPending ? t('Searching') : t('Search')}
                </Button>
                <Button
                  variant='tonal'
                  color='secondary'
                  type='button'
                  onClick={onHandleClearSearchFilters}
                  disabled={isPending}
                >
                  {t('Clear')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  )
}
export default HrCheckerSearchFilter
