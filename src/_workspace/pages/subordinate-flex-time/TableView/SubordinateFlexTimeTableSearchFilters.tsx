import { useState } from 'react'
import { Card, CardHeader, CardContent, Grid, Button, Box, Collapse, IconButton, CircularProgress } from '@mui/material'
import { Controller, SubmitHandler, SubmitErrorHandler, useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchSection } from '@/_workspace/react-select/async-promise-load-options/fetchSection'
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
  const { control, getValues, setValue, handleSubmit } = useFormContext<FormDataPage>()
  const { t } = useTranslation()

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
          tableEmployeeName: getValues('searchFilters.tableEmployeeName'),
          tableSection: getValues('searchFilters.tableSection')
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
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_SUBORDINATE`] })
    saveUserSettings()
  }

  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters.tableEmployeeCode', '')
    setValue('searchFilters.tableEmployeeName', '')
    setValue('searchFilters.tableSection', null)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_SUBORDINATE`] })
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
                defaultValue=''
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Employee Code')}
                    placeholder={t('Enter employee code')}
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='searchFilters.tableEmployeeName'
                control={control}
                defaultValue=''
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Employee Name')}
                    placeholder={t('Enter employee name')}
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='searchFilters.tableSection'
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
