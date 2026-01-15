// React Imports
import { useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid, Collapse, IconButton, CircularProgress } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

// React Hook Form Imports
import { Controller, useFormContext } from 'react-hook-form'

// React Query
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrUserLeave'

// Components Imports
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import CustomTextField from '@/components/mui/TextField'

// libs Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// Utils
import { fetchSection } from '@/_workspace/react-select/async-promise-load-options/fetchSection'
import { fetchAllEmployee } from '@/_workspace/react-select/async-promise-load-options/fetchAllEmployee'

// Types
import { FormDataPage } from './validationSchema'
import { MENU_ID } from './env'
import { useTranslation } from '@/contexts/TranslationContext'

const UserLeaveSearchFilter = () => {
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
          employeeName: getValues('searchFilters.employeeName'),
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
      }
    }
    mutate(dataItem)
  }

  const onMutateSuccess = () => {}
  const onMutateError = (e: any) => {}

  const { mutate } = useCreate(onMutateSuccess, onMutateError)

  const onSubmit = (data: FormDataPage) => {
    setValue('submittedFilters', data.searchFilters)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const handleClear = () => {
    setValue('searchFilters', {
      employeeCode: null,
      employeeName: '',
      section: null
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
                    loadOptions={() => fetchAllEmployee({}) as any}
                    getOptionLabel={data => data.EMPLOYEE_CODE || ''}
                    getOptionValue={data => data.EMPLOYEE_CODE || ''}
                    placeholder={t('Enter employee code')}
                    classNamePrefix='select'
                  />
                )}
              />
            </Grid>

            {/*------------ Employee Name ------------------*/}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.employeeName'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={t('Employee Name')}
                    placeholder={t('Enter employee name')}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/*------------ Section ------------------*/}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.section'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <AsyncSelectCustom
                    {...field}
                    label={t('Section')}
                    placeholder={t('Select Section')}
                    defaultOptions
                    isClearable
                    cacheOptions
                    classNamePrefix={'select'}
                    loadOptions={fetchSection as any}
                    getOptionValue={(option: any) => option.SECTION || ''}
                    getOptionLabel={(option: any) => option.SECTION || ''}
                    error={!!error}
                    helperText={error?.message}
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

export default UserLeaveSearchFilter
