import { useState, useMemo } from 'react'
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
import dayjs from 'dayjs'
import classNames from 'classnames'
import SelectCustom from '@/components/react-select/SelectCustom'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@/components/mui/TextField'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY, useGetFlexTimeTypes } from '@/_workspace/react-query/hooks/useFlexTime'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import { FormDataPage, StatusOption } from './validationSchema'
import { FLEX_TIME_TYPE_OPTIONS } from '@/_workspace/types/flex-time/FlexTimeInterface'
import { MENU_ID } from './env'
import { th, enGB } from 'date-fns/locale'

function FlexTimeHistorySearchFilter() {
  const { setIsEnableFetching } = useDxContext()
  const [collapse, setCollapse] = useState(false)
  const queryClient = useQueryClient()
  const { control, setValue, getValues, handleSubmit } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState({ control })
  const { t, locale } = useTranslation()
  const { data: flexTimeTypesData, isLoading: isLoadingFlexTimeTypes } = useGetFlexTimeTypes(true)
  const flexTimeTypeOptions = useMemo(() => {
    const resultOnDb = flexTimeTypesData?.data?.ResultOnDb as any
    if (Array.isArray(resultOnDb) && resultOnDb.length > 0) {
      return resultOnDb.map((item: any) => ({
        value: String(item.FLEX_TIME_TYPE_ID),
        label: item.FLEX_TIME_DESCRIPTION
      }))
    }
    return FLEX_TIME_TYPE_OPTIONS
  }, [flexTimeTypesData])
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      flexTimeType: null,
      requestDate: null,
      startDate: null,
      endDate: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_HISTORY`] })
    saveUserSettings()
  }
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [`${PREFIX_QUERY_KEY}_HISTORY`] })
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
          flexTimeType: getValues('searchFilters.flexTimeType'),
          requestDate: getValues('searchFilters.requestDate'),
          startDate: getValues('searchFilters.startDate'),
          endDate: getValues('searchFilters.endDate')
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
              {/* Flex Time Type */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.flexTimeType'
                  control={control}
                  render={({ field }) => (
                    <SelectCustom<StatusOption>
                      {...field}
                      label={t('Flex Time Type')}
                      options={flexTimeTypeOptions}
                      getOptionLabel={option => option.label}
                      getOptionValue={option => option.value}
                      placeholder={t('Select type')}
                      isClearable
                      isLoading={isLoadingFlexTimeTypes}
                      classNamePrefix={'select'}
                    />
                  )}
                />
              </Grid>
              {/* Flex Time Request Date */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.requestDate'
                  control={control}
                  defaultValue={null}
                  render={({ field: { value, onChange } }) => (
                    <AppReactDatepicker
                      autoComplete='off'
                      selected={value ? new Date(value) : null}
                      id='requestDate'
                      dateFormat='dd MMM yyyy'
                      locale={locale === 'th' ? th : enGB}
                      onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                      placeholderText={t('Choose a date')}
                      isClearable
                      customInput={
                        <CustomTextField
                          fullWidth
                          label={t('Flex Time Request Date')}
                        />
                      }
                    />
                  )}
                />
              </Grid>
              {/* Start Date */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.startDate'
                  control={control}
                  defaultValue={null}
                  render={({ field: { value, onChange } }) => (
                    <AppReactDatepicker
                      autoComplete='off'
                      selected={value ? new Date(value) : null}
                      id='startDate'
                      dateFormat='dd MMM yyyy'
                      locale={locale === 'th' ? th : enGB}
                      onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                      placeholderText={t('Choose start date')}
                      isClearable
                      customInput={
                        <CustomTextField fullWidth label={t('Start Date')} />
                      }
                    />
                  )}
                />
              </Grid>
              {/* End Date */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.endDate'
                  control={control}
                  defaultValue={null}
                  render={({ field: { value, onChange } }) => (
                    <AppReactDatepicker
                      autoComplete='off'
                      selected={value ? new Date(value) : null}
                      id='endDate'
                      dateFormat='dd MMM yyyy'
                      locale={locale === 'th' ? th : enGB}
                      onChange={(date: Date | null) => onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                      placeholderText={t('Choose end date')}
                      isClearable
                      minDate={
                        getValues('searchFilters.startDate') ? new Date(getValues('searchFilters.startDate')!) : undefined
                      }
                      customInput={
                        <CustomTextField fullWidth label={t('End Date')} />
                      }
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
export default FlexTimeHistorySearchFilter
