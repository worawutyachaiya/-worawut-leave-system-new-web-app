import { useState } from 'react'

import { Button, Card, CardContent, CardHeader, Grid, Collapse, IconButton, CircularProgress } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import { Controller, useFormContext } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SelectCustom from '@/components/react-select/SelectCustom'
import CustomTextField from '@/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@utils/user-profile/userLoginProfile'

import { useDxContext } from '@/_template/DxContextProvider'

import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import fetchLeaveTypeHR from '@/_workspace/react-select/async-promise-load-options/fetchLeaveTypeHR'
import { getImgLeaveType } from '../../../assets/leave-type-function/ImgLeaveType'
import dayjs from 'dayjs'

import { FormDataPage, StatusOption, statusOption } from './ValidationSchema'
import { MENU_ID } from './env'
import { useTranslation } from '@/contexts/TranslationContext'

const PREFIX_QUERY_KEY = 'HR_CHECK_M75'

const HrCheckM75SearchFilter = () => {
  const { t } = useTranslation()
  const [collapse, setCollapse] = useState(true)
  const { control, handleSubmit, setValue, getValues } = useFormContext<FormDataPage>()
  const queryClient = useQueryClient()
  const { setIsEnableFetching, isEnableFetching } = useDxContext()

  // Save user profile settings
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          employeeCode: getValues('searchFilters.employeeCode'),
          leaveType: getValues('searchFilters.leaveType'),
          startDate: getValues('searchFilters.startDate'),
          endDate: getValues('searchFilters.endDate'),
          status: getValues('searchFilters.status')
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
      }
    }
    mutate(dataItem)
  }

  const onMutateSuccess = () => {}
  const onMutateError = (e: any) => {
    console.error('Save profile error:', e)
  }

  const { mutate } = useCreate(onMutateSuccess, onMutateError)

  const onSubmit = (data: FormDataPage) => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const handleClear = () => {
    setValue('searchFilters', {
      employeeCode: null,
      leaveType: null,
      startDate: null,
      endDate: null,
      status: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  return (
    <Card sx={{ marginBottom: 4 }}>
      <CardHeader
        title={t('Search filters')}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <IconButton onClick={() => setCollapse(!collapse)}>
            {collapse ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      />
      <Collapse in={collapse} timeout='auto' unmountOnExit>
        <CardContent>
          <Grid container spacing={4}>
            {/*------------ Employee Code ------------------*/}
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
                    loadOptions={async inputValue => {
                      const employees = await fetchAllEmployee({
                        EMPLOYEE_CODE: inputValue || ''
                      })
                      return employees.map(option => ({
                        ...option,
                        EMPLOYEE_CODE: option.EMPLOYEE_CODE ?? ''
                      }))
                    }}
                    getOptionLabel={(data: any) => data.EMPLOYEE_CODE || ''}
                    getOptionValue={(data: any) => data.EMPLOYEE_CODE || ''}
                    placeholder={t('Enter employee code')}
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>

            {/*------------ Leave Type ------------------*/}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.leaveType'
                control={control}
                render={({ field: { ref, ...fieldProps }, fieldState: { error } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isMulti
                    closeMenuOnSelect={false}
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
                )}
              />
            </Grid>

            {/* ------------- Start Date ------------------------------------------------------------- */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='searchFilters.startDate'
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <AppReactDatepicker
                    selected={value ? dayjs(value, 'YYYY-MM-DD').toDate() : null}
                    onChange={date => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                    autoComplete='off'
                    placeholderText={t('Select start date')}
                    customInput={<CustomTextField label={t('Start Date')} fullWidth error={!!error} />}
                  />
                )}
              />
            </Grid>

            {/* ------------- End Date ------------------------------------------------------------- */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='searchFilters.endDate'
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <AppReactDatepicker
                    selected={value ? dayjs(value, 'YYYY-MM-DD').toDate() : null}
                    onChange={date => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                    autoComplete='off'
                    placeholderText={t('Select end date')}
                    customInput={<CustomTextField label={t('End Date')} fullWidth error={!!error} />}
                  />
                )}
              />
            </Grid>

            {/* ------------- Status ------------------------------------------------------------- */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='searchFilters.status'
                control={control}
                render={({ field }) => (
                  <SelectCustom<StatusOption, false>
                    {...field}
                    label={t('Status')}
                    options={statusOption}
                    getOptionLabel={(option: StatusOption) => option.label}
                    getOptionValue={(option: StatusOption) => option.value}
                    placeholder={t('Select status')}
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>

            {/*------------ Buttons ------------------*/}
            <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
              <Button
                type='button'
                variant='contained'
                color='primary'
                onClick={handleSubmit(onSubmit)}
                startIcon={isEnableFetching ? <CircularProgress size={16} color='inherit' /> : null}
                disabled={isEnableFetching}
              >
                {t('Search')}
              </Button>
              <Button type='button' variant='tonal' color='secondary' onClick={handleClear}>
                {t('Clear')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default HrCheckM75SearchFilter
