import { useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
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
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDxContext } from '@/_template/DxContextProvider'
import { fetchLeaveType } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveType'
import { getImgLeaveType } from '@/_workspace/pages/leave-history/leave-history-function/ImgLeaveType'
import { useTranslation } from '@/contexts/TranslationContext'
import { MENU_ID } from './env'
import type { FormDataPage } from './validationSchema'
const LEAVE_HISTORY_QUERY_KEY = 'LEAVE_HISTORY'
function LeaveHistorySearchFilters() {
  const { setIsEnableFetching } = useDxContext()
  const [collapse, setCollapse] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState({ control })
  const watchRequestDate = watch('searchFilters.requestDate')
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', {
      requestDate: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [LEAVE_HISTORY_QUERY_KEY] })
    saveUserSettings()
  }
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [LEAVE_HISTORY_QUERY_KEY] })
    saveUserSettings()
  }
  const onError: SubmitErrorHandler<FormDataPage> = errors => {
    console.log('Search Errors:', errors)
  }
  const saveUserSettings = () => {
    const currentRequestDate = getValues('searchFilters.requestDate')
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          requestDate: currentRequestDate
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
              {/* Request Time Record Date */}
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
                      dateFormat='dd-MMM-yyyy'
                      onChange={(date: Date | null) => {
                        onChange(date)
                      }}
                      placeholderText={t('Choose a date')}
                      isClearable
                      customInput={<CustomTextField label={t('Request Time Record Date')} fullWidth />}
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
export default LeaveHistorySearchFilters
