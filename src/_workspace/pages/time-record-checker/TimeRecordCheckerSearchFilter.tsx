import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { Button, Card, CardContent, CardHeader, Grid, Collapse, IconButton, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext } from 'react-hook-form'
import CustomTextField from '@/components/mui/TextField'
import { useDxContext } from '@/_template/DxContextProvider'
import { FormDataPage } from './validationSchema'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'
import SelectCustom from '@/components/react-select/SelectCustom'
import { fetchSection } from '@/_workspace/react-select/async-promise-load-options/fetchSection'
import { HR_CHECK_STATUS_OPTIONS, APPROVE_STATUS_OPTIONS } from '@/_workspace/types/hr-checker/HrCheckerInterface'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import { useQueryClient } from '@tanstack/react-query'
const PREFIX_QUERY_KEY = 'TIME_RECORD_CHECKER'
function TimeRecordCheckerSearchFilter() {
  const [isExpanded, setIsExpanded] = useState(true)
  const { setIsEnableFetching } = useDxContext()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { control, getValues, setValue, handleSubmit } = useFormContext<FormDataPage>()
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      employeeCode: null,
      section: null,
      status: null
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
    const currentSection = getValues('searchFilters.section')
    const currentStatus = getValues('searchFilters.status')
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          employeeCode: currentEmployeeCode,
          section: currentSection,
          status: currentStatus
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
            <Grid item xs={12} md={3}>
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
                    getOptionLabel={data => data.EMPLOYEE_CODE || ''}
                    getOptionValue={data => data.EMPLOYEE_CODE || ''}
                    placeholder={t('Enter employee code')}
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name='searchFilters.section'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={async inputValue => {
                      const result = await fetchSection(inputValue)
                      return result as any
                    }}
                    getOptionValue={data => data?.SECTION?.toString() || ''}
                    getOptionLabel={data => `${data?.SECTION}` || ''}
                    classNamePrefix='select'
                    label={t('Section')}
                    placeholder={t('Select Section')}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            {/* Status */}
            <Grid item xs={12} md={3}>
              <Controller
                name='searchFilters.status'
                control={control}
                render={({ field }) => (
                  <SelectCustom
                    {...field}
                    label={t('Status')}
                    options={HR_CHECK_STATUS_OPTIONS}
                    getOptionLabel={option => option.label}
                    getOptionValue={option => option.value}
                    placeholder={t('Select status')}
                    isClearable={false}
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='contained' color='primary' onClick={handleSubmit(onSubmit, onError)}>
                  {isPending ? t('Searching...') : t('Search')}
                </Button>
                <Button variant='tonal' color='secondary' onClick={onHandleClearSearchFilters}>
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
export default TimeRecordCheckerSearchFilter
