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
import Typography from '@mui/material/Typography'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import classNames from 'classnames'
import CustomTextField from '@/components/mui/TextField'
import SkeletonCustom from '@/components/SkeletonCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useFlexTime'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { fetchSection } from '@/_workspace/react-select/async-promise-load-options/fetchSection'
import { useDxContext } from '@/_template/DxContextProvider'
import { FormDataPage } from './validationSchema'
import { MENU_ID } from './env'
function FlexTimeApprovalSearchFilter() {
  const { setIsEnableFetching } = useDxContext()
  const [collapse, setCollapse] = useState(false)
  const queryClient = useQueryClient()
  const { control, setValue, getValues, handleSubmit } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState({ control })
  const { t } = useTranslation()
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      employeeName: '',
      employeeCode: '',
      section: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_APPROVAL`] })
    saveUserSettings()
  }
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_APPROVAL`] })
    saveUserSettings()
  }
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }
  const saveUserSettings = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID,
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          employeeName: getValues('searchFilters.employeeName'),
          employeeCode: getValues('searchFilters.employeeCode'),
          section: getValues('searchFilters.section')
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
              {/* Employee ID */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeCode'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={t('Employee CODE')}
                      placeholder={t('Enter employee code')}
                      value={field.value || ''}
                    />
                  )}
                />
              </Grid>
              {/* Employee Name */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.employeeName'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={t('Employee Name')}
                      placeholder={t('Enter employee name')}
                      value={field.value || ''}
                    />
                  )}
                />
              </Grid>
              {/* Section - Dropdown */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.section'
                  control={control}
                  defaultValue={null}
                  render={({ field: { ref, ...fieldProps }, fieldState: { error: fieldError } }) => (
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
                      error={!!fieldError}
                      helperText={fieldError?.message}
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
export default FlexTimeApprovalSearchFilter
