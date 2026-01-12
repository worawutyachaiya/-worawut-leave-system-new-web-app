import { useState } from 'react'
import { Card, CardHeader, CardContent, Grid, Button, Box, Collapse, IconButton, CircularProgress } from '@mui/material'
import { Controller, SubmitHandler, SubmitErrorHandler, useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import CustomTextField from '@/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import { useTranslation } from '@/contexts/TranslationContext'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { useDxContext } from '@/_template/DxContextProvider'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useFlexTime'
import { MENU_ID } from '../env'
import type { FormDataPage } from '../validationSchema'

function SubordinateFlexTimeTableSearchFilters() {
  const [collapse, setCollapse] = useState(false)
  const { setIsEnableFetching } = useDxContext()
  const queryClient = useQueryClient()
  const { control, getValues, setValue, handleSubmit, watch } = useFormContext<FormDataPage>()
  const { t } = useTranslation()

  const startDate = watch('searchFilters.tableStartDate')

  const onMutateSuccess = () => {}
  const onMutateError = (e: any) => {
    console.error('Save settings error:', e)
  }
  const { mutate, isPending } = useCreate(onMutateSuccess, onMutateError)

  const saveUserSettings = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          employeeCode: getValues('searchFilters.employeeCode'),
          employeeInfo: getValues('searchFilters.employeeInfo'),
          tableEmployeeCode: getValues('searchFilters.tableEmployeeCode'),
          tableStartDate: getValues('searchFilters.tableStartDate'),
          tableEndDate: getValues('searchFilters.tableEndDate')
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

  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_HR_CHECKER`] })
    saveUserSettings()
  }

  const onError: SubmitErrorHandler<FormDataPage> = _errors => {}

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters.tableEmployeeCode', null)
    setValue('searchFilters.tableStartDate', null)
    setValue('searchFilters.tableEndDate', null)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_HR_CHECKER`] })
    saveUserSettings()
  }

  return (
    <Card sx={{ overflow: 'visible', zIndex: 4, mb: 4 }}>
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
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='searchFilters.tableEmployeeCode'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={async inputValue => {
                      const result = await fetchAllEmployee({ EMPLOYEE_ID: inputValue })
                      return result as any
                    }}
                    getOptionValue={data => data?.EMPLOYEE_ID?.toString() || data?.EMPLOYEE_CODE?.toString() || ''}
                    getOptionLabel={data => data?.EMPLOYEE_ID?.toString() || data?.EMPLOYEE_CODE?.toString() || ''}
                    classNamePrefix='select'
                    label={t('Employee CODE')}
                    placeholder={t('Enter employee code')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='searchFilters.tableStartDate'
                control={control}
                defaultValue={null}
                render={({ field: { value, onChange } }) => (
                  <AppReactDatepicker
                    autoComplete='off'
                    selected={value ? new Date(value) : null}
                    id='tableStartDate'
                    dateFormat='dd-MMM-yyyy'
                    onChange={(date: Date | null) => {
                      onChange(date)
                    }}
                    placeholderText={t('Choose start date')}
                    isClearable
                    customInput={<CustomTextField label={t('Start Date')} fullWidth />}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='searchFilters.tableEndDate'
                control={control}
                defaultValue={null}
                render={({ field: { value, onChange } }) => (
                  <AppReactDatepicker
                    autoComplete='off'
                    selected={value ? new Date(value) : null}
                    id='tableEndDate'
                    dateFormat='dd-MMM-yyyy'
                    onChange={(date: Date | null) => {
                      onChange(date)
                    }}
                    minDate={startDate ? new Date(startDate) : undefined}
                    placeholderText={t('Choose end date')}
                    isClearable
                    customInput={<CustomTextField label={t('End Date')} fullWidth />}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
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

export default SubordinateFlexTimeTableSearchFilters
