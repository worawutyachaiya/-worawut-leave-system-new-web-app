import { useState } from 'react'
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
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { useDxContext } from '@/_template/DxContextProvider'
import type { FormDataPage } from './validationSchema'
import dayjs from 'dayjs'
import CustomTextField from '@/components/mui/TextField'
import SkeletonCustom from '@/components/SkeletonCustom'
import { Typography } from '@mui/material'
import { fetchSection } from '@/_workspace/react-select/async-promise-load-options/fetchSection'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import { useTranslation } from '@/contexts/TranslationContext'
const LEAVE_APPROVAL_QUERY_KEY = 'LEAVE_APPROVAL'
function LeaveApprovalSearchFilter() {
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
  const { setIsEnableFetching } = useDxContext()
  const [collapse, setCollapse] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState({ control })
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const handleClear = () => {
    setValue('searchFilters', {
      employeeCode: '',
      employeeName: '',
      section: null,
      startDate: dayjs(new Date()).format('YYYY-MM-DD'),
      department: null,
      leaveType: null
    } as any)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [LEAVE_APPROVAL_QUERY_KEY] })
    saveUserSettings()
  }
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [LEAVE_APPROVAL_QUERY_KEY] })
    saveUserSettings()
  }
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }
  const onMutateSuccess = () => {
  }
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
              {/* Employee Code */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeCode'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      placeholder={t('Enter employee code')}
                      label={`${t('Employee Code')}`}
                    />
                  )}
                />
              </Grid>
              {/* Employee Name */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      placeholder={t('Enter employee name')}
                      label={`${t('Employee Name')}`}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
                      label='Section'
                      placeholder='Select Section'
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              {/* Action Buttons */}
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
                  <Button variant='tonal' color='secondary' type='button' onClick={handleClear} disabled={isPending}>
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
export default LeaveApprovalSearchFilter
