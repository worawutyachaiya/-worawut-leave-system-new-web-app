import { useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import CircularProgress from '@mui/material/CircularProgress'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import { useTranslation } from '@/contexts/TranslationContext'
import { fetchSection } from '@/_workspace/react-select/async-promise-load-options/fetchSection'
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import { PREFIX_QUERY_KEY_REMAIN_LEAVE } from '@/_workspace/react-query/hooks/useSearchRemainLeave'
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'

function RemainLeaveSearchFilter() {
  const { setIsEnableFetching } = useDxContext()
  const [collapse, setCollapse] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState({ control })
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      employeeCode: null,
      employeeName: null,
      section: null,
      startDate: null,
      department: null,
      leaveType: null
    } as any)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_REMAIN_LEAVE] })
    saveUserSettings()
  }

  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY_REMAIN_LEAVE] })
    saveUserSettings()
  }

  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }

  const saveUserSettings = () => {
    const currentEmployeeCode = getValues('searchFilters.employeeCode')
    const currentEmployeeName = getValues('searchFilters.employeeName')
    const currentSection = getValues('searchFilters.section')
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          employeeCode: currentEmployeeCode,
          employeeName: currentEmployeeName,
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
  const { mutate, isPending, isError, error } = useCreate(onMutateSuccess, onMutateError)

  return (
    <Card sx={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title={t('Search filters')}
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
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
              {/* ------------- Employee Code ------------------------------------------------------------- */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeCode'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      key={`${watch('searchFilters.section')?.SECTION}`}
                      placeholder={t('Enter Employee Code')}
                      label={t('Employee Code')}
                      classNamePrefix='select'
                      loadOptions={async inputValue => {
                        const employees = await fetchAllEmployee({
                          EMPLOYEE_CODE: inputValue || '',
                          SECT_NAME: watch('searchFilters.section')?.SECTION || ''
                        })
                        return employees.map(option => ({
                          ...option,
                          EMPLOYEE_CODE: option.EMPLOYEE_CODE ?? ''
                        }))
                      }}
                      onChange={value => {
                        onChange(value)
                      }}
                      getOptionValue={(option: any) => option.EMPLOYEE_CODE || option.FULL_NAME || ''}
                      getOptionLabel={(option: any) => {
                        const code = option.EMPLOYEE_CODE || option.EMP_ID || ''
                        const name = option.FULL_NAME || option.EMPLOYEE_FULL_NAME || option.EMPLOYEE_NAME || ''
                        if (name && code) return `${code} - ${name}`
                        if (name) return name
                        if (code) return code
                        return 'Unknown'
                      }}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              {/* ------------- Employee Name (text input) -------------------------------------------- */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeName'
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={t('Employee Name')}
                      placeholder={t('Enter employee name')}
                      onChange={e => field.onChange(e.target.value)}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              {/* ------------- Section ------------------------------------------------------------- */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.section'
                  control={control}
                  render={({ field: { onChange, ...fieldProps }, fieldState: { error } }) => (
                    <AsyncSelectCustom
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      placeholder={t('Select Section')}
                      label={t('Section')}
                      classNamePrefix='select'
                      loadOptions={(inputValue: any) => {
                        return fetchSection(inputValue || '') as any
                      }}
                      onChange={(value: any) => {
                        const mappedValue = value
                          ? {
                              SECTION: value.SECT_NAME || value.SECTION || '',
                              DEPARTMENT: value.DEPARTMENT || ''
                            }
                          : null
                        onChange(mappedValue)
                        setValue('searchFilters.employeeCode', null)
                        setValue('searchFilters.employeeName', null)
                      }}
                      getOptionValue={(option: any) => option.SECT_NAME || option.SECTION || ''}
                      getOptionLabel={(option: any) => option.SECT_NAME || option.SECTION || ''}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              {/* ------------- Action Buttons ------------------------------------------------------------- */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant='contained'
                    type='button'
                    onClick={() => handleSubmit(onSubmit, onError)()}
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
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default RemainLeaveSearchFilter
