import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import { fetchLeaveType } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveType'
import { getImgLeaveType } from '../../../assets/leave-type-function/ImgLeaveType'
import type { FormDataPage } from './validationSchema'
import dayjs from 'dayjs'
import { PREFIX_QUERY_KEY_EMPLOYEE_LEAVE } from '@/_workspace/react-query/hooks/useLeaveEmployeeLeaveSearch'
import {
  fetchDepartmentByLikeGroupByFromMember,
  fetchByLikeEmployeeCodeByDept,
  fetchByLikeEmployeeCodeByDeptAndSection,
  fetchByLikeEmployeeCodeWithoutDeptFitel,
  fetchByLikeEmployeeCodeBySection,
  fetchEmployeeFullName,
  fetchEmployeeFullNameByDept,
  fetchEmployeeFullNameByDeptAndSection,
  fetchEmployeeFullNameBySection,
  fetchSectionByDepartmentFromMember,
  fetchSectionFromMember
} from '@/_workspace/react-select/async-promise-load-options/fetchEmployeeLeave'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { MENU_ID } from './env'
import { Typography } from '@mui/material'
import SkeletonCustom from '@/components/SkeletonCustom'
function EmployeeLeaveSearchFilters() {
  const { setIsEnableFetching } = useDxContext()
  const [collapse, setCollapse] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormDataPage>()
  const { isLoading, isSubmitting } = useFormState({ control })
  const queryClient = useQueryClient()
  const { t, locale } = useTranslation()
  dayjs.locale(locale === 'th' ? 'th' : 'en')
  const handleClear = () => {
    setValue('searchFilters', {
      employeeCode: null,
      employeeName: null,
      startDate: dayjs(new Date()).format('YYYY-MM-DD'),
      department: null,
      section: null,
      leaveType: null
    } as any)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_EMPLOYEE_LEAVE] })
    saveUserSettings()
  }
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_EMPLOYEE_LEAVE] })
    saveUserSettings()
  }
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }
  const saveUserSettings = () => {
    const currentEmployeeCode = getValues('searchFilters.employeeCode')
    const currentEmployeeName = getValues('searchFilters.employeeName')
    const currentDepartment = getValues('searchFilters.department')
    const currentLeaveType = getValues('searchFilters.leaveType')
    const currentSection = getValues('searchFilters.section')
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          department: currentDepartment,
          employeeCode: currentEmployeeCode,
          employeeName: currentEmployeeName,
          leaveType: currentLeaveType,
          section: currentSection
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
  const { mutate, isError, error, isPending } = useCreate(onMutateSuccess, onMutateError)
  return (
    <Card>
      <CardHeader
        title={t('Search filters')}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
      />
      {/* Collapse ใช้ซ่อน/แสดงเนื้อหาตามค่า state collapse */}
      <Collapse in={!collapse}>
        <CardContent>
          {isError && (
            <Typography color='error' sx={{ mb: 2 }}>
              An error occurred: {error?.message}
            </Typography>
          )}
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <Grid container spacing={4}>
              {/* ------------- Employee Code  ------------------------------------------------------------- */}
              <Grid item xs={12} md={4}>
                <Controller
                  name='searchFilters.employeeCode'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <>
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`${watch('searchFilters.department')?.DEPARTMENT}_${watch('searchFilters.section')?.SECTION}`}
                        placeholder={t('Select Employee Code')}
                        label={t('Employee Code')}
                        classNamePrefix='select'
                        loadOptions={inputValue => {
                          const dept = getValues('searchFilters.department')?.DEPARTMENT
                          const section = getValues('searchFilters.section')?.SECTION
                          if (dept && section) {
                            return fetchByLikeEmployeeCodeByDeptAndSection({
                              EMPLOYEE_CODE: inputValue,
                              DEPARTMENT: dept,
                              SECTION: section
                            })
                          } else if (dept) {
                            return fetchByLikeEmployeeCodeByDept({ EMPLOYEE_CODE: inputValue, DEPARTMENT: dept })
                          } else if (section) {
                            return fetchByLikeEmployeeCodeBySection({ EMPLOYEE_CODE: inputValue, SECTION: section })
                          } else {
                            return fetchByLikeEmployeeCodeWithoutDeptFitel({ EMPLOYEE_CODE: inputValue })
                          }
                        }}
                        onChange={value => {
                          onChange(value)
                          if (value === null) {
                            setValue('searchFilters.employeeName', null)
                          } else {
                            setValue('searchFilters.employeeName', { FULL_NAME: value.FULL_NAME })
                            setValue('searchFilters.department', { DEPARTMENT: value.DEPARTMENT })
                            setValue('searchFilters.section', { SECTION: value.SECTION })
                          }
                        }}
                        getOptionValue={option => option.EMPLOYEE_CODE || ''}
                        getOptionLabel={option => `${option.EMPLOYEE_CODE}`}
                      />
                    </>
                  )}
                />
              </Grid>
              {/* -------------  Employee Name  ------------------------------------------------------------- */}
              <Grid item xs={12} md={4}>
                <Controller
                  name='searchFilters.employeeName'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <>
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`name_${watch('searchFilters.department')?.DEPARTMENT}_${watch('searchFilters.section')?.SECTION}`}
                        placeholder={t('Select Employee Name')}
                        label={t('Employee Name')}
                        classNamePrefix='select'
                        loadOptions={inputValue => {
                          const dept = getValues('searchFilters.department')?.DEPARTMENT
                          const section = getValues('searchFilters.section')?.SECTION
                          if (dept && section) {
                            return fetchEmployeeFullNameByDeptAndSection({
                              FULL_NAME: inputValue,
                              DEPARTMENT: dept,
                              SECTION: section
                            })
                          } else if (dept) {
                            return fetchEmployeeFullNameByDept({ FULL_NAME: inputValue, DEPARTMENT: dept })
                          } else if (section) {
                            return fetchEmployeeFullNameBySection({ FULL_NAME: inputValue, SECTION: section })
                          } else {
                            return fetchEmployeeFullName({ FULL_NAME: inputValue })
                          }
                        }}
                        onChange={value => {
                          onChange(value)
                          if (value === null) {
                            setValue('searchFilters.employeeCode', null)
                          } else {
                            setValue('searchFilters.employeeCode', { EMPLOYEE_CODE: value.EMPLOYEE_CODE })
                            setValue('searchFilters.department', { DEPARTMENT: value.DEPARTMENT })
                            setValue('searchFilters.section', { SECTION: value.SECTION })
                          }
                        }}
                        getOptionValue={option => option.FULL_NAME || ''}
                        getOptionLabel={option => `${option.FULL_NAME}`}
                      />
                    </>
                  )}
                />
              </Grid>
              {/* -------------  Leave Date  ------------------------------------------------------------- */}
              <Grid item xs={12} md={4}>
                <Controller
                  name='searchFilters.startDate'
                  control={control}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <AppReactDatepicker
                        selected={value ? dayjs(value, 'YYYY-MM-DD').toDate() : null}
                        onChange={date => onChange(date ? dayjs(date).format('YYYY-MMM-DD') : null)}
                        disabled
                        readOnly
                        autoComplete='off'
                        placeholderText={dayjs(new Date()).format('DD MMM YYYY')}
                        customInput={<CustomTextField label={t('Leave Date')} fullWidth error={!!error} />}
                      />
                    </>
                  )}
                />
              </Grid>
              {/* -------------  Department ------------------------------------------------------------- */}
              <Grid item xs={12} md={4}>
                <Controller
                  name='searchFilters.department'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <>
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        placeholder={t('Select Department')}
                        label={t('Department')}
                        classNamePrefix='select'
                        loadOptions={inputValue => fetchDepartmentByLikeGroupByFromMember(inputValue || '')}
                        onChange={value => {
                          onChange(value)
                          setValue('searchFilters.section', null)
                          setValue('searchFilters.employeeCode', null)
                          setValue('searchFilters.employeeName', null)
                        }}
                        getOptionValue={option => option.DEPARTMENT || ''}
                        getOptionLabel={option => option.DEPARTMENT || ''}
                      />
                    </>
                  )}
                />
              </Grid>
              {/* -------------  Section ------------------------------------------------------------- */}
              <Grid item xs={12} md={4}>
                <Controller
                  name='searchFilters.section'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <>
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        key={`section_${watch('searchFilters.department')?.DEPARTMENT}`}
                        placeholder={t('Select Section')}
                        label={t('Section')}
                        classNamePrefix='select'
                        loadOptions={inputValue => {
                          const dept = getValues('searchFilters.department')?.DEPARTMENT
                          if (dept) {
                            return fetchSectionByDepartmentFromMember(dept, inputValue || '')
                          }
                          return fetchSectionFromMember(inputValue || '')
                        }}
                        onChange={value => {
                          onChange(value)
                          if (value?.DEPARTMENT) {
                            setValue('searchFilters.department', { DEPARTMENT: value.DEPARTMENT })
                          }
                          setValue('searchFilters.employeeCode', null)
                          setValue('searchFilters.employeeName', null)
                        }}
                        getOptionValue={option => option.SECTION || ''}
                        getOptionLabel={option => option.SECTION || ''}
                      />
                    </>
                  )}
                />
              </Grid>
              {/* -------------  Leave Type (ประเภทการลา) ------------------------------------------------------------- */}
              <Grid item xs={12} md={4}>
                <Box>
                  <Controller
                    name='searchFilters.leaveType'
                    control={control}
                    render={({ field: { onChange, value, ...fieldProps }, fieldState: { error } }) => (
                      <>
                        <AsyncSelectCustom
                          {...fieldProps}
                          value={value}
                          onChange={selectedValue => {
                            onChange(selectedValue)
                          }}
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
                          placeholder={t('Select Leave Type')}
                          error={!!error}
                        />
                      </>
                    )}
                  />
                </Box>
              </Grid>
              {/* ------------- Action Buttons  ------------------------------------------------------------- */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* ------------- Search Button  ------------------------------------------------------------- */}
                  <Button
                    variant='contained'
                    type='button'
                    onClick={() => handleSubmit(onSubmit, onError)()}
                    disabled={isSubmitting || isLoading}
                    startIcon={isSubmitting ? <CircularProgress size={16} color='inherit' /> : null}
                  >
                    {isPending ? t('Searching') : t('Search')}
                  </Button>
                  {/* ------------- Clear Button  ------------------------------------------------------------- */}
                  <Button
                    variant='tonal'
                    color='secondary'
                    type='button'
                    onClick={handleClear}
                    disabled={isSubmitting || isLoading}
                  >
                    {t('Clear')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}
export default EmployeeLeaveSearchFilters
