// React Imports
import { useState } from 'react'

// MUI Imports
import { Button, Card, CardContent, CardHeader, Grid, Collapse, IconButton, CircularProgress } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

// React Hook Form Imports
import { Controller, useFormContext } from 'react-hook-form'

// Third-party Imports
import { useQueryClient } from '@tanstack/react-query'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'

// libs Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@utils/user-profile/userLoginProfile'

// _template Imports
import { useDxContext } from '@/_template/DxContextProvider'

// Types
import { FormDataPage, statusOptions } from './validationSchema'
import { MENU_ID } from './env'

// Query Key
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrLeaveTypeName'

import { useTranslation } from '@/contexts/TranslationContext'

const LeaveTypeSearchFilter = () => {
  const { t } = useTranslation()
  const [collapse, setCollapse] = useState(true)
  const { control, handleSubmit, setValue, getValues } = useFormContext<FormDataPage>()
  const { setIsEnableFetching, isEnableFetching } = useDxContext()
  const queryClient = useQueryClient()

  // Save user profile settings
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          leaveTypeCode: getValues('searchFilters.leaveTypeCode'),
          leaveTypeName: getValues('searchFilters.leaveTypeName'),
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
      leaveTypeCode: '',
      leaveTypeName: '',
      status: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  return (
    <Card sx={{ marginBottom: 4 }}>
      <CardHeader
        title='Search filters'
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
            {/*------------ Leave Type Code ------------------*/}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.leaveTypeCode'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label='Leave Type Code'
                    placeholder='Enter leave type code'
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/*------------ Leave Type Name ------------------*/}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.leaveTypeName'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label='Leave Type Name'
                    placeholder='Enter leave type name'
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/*------------ Status ------------------*/}
            <Grid item xs={12} md={4}>
              <Controller
                name='searchFilters.status'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SelectCustom
                    {...field}
                    label='Status'
                    placeholder='Select status'
                    options={statusOptions}
                    isClearable
                    error={!!error}
                    classNamePrefix={'select'}
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
                {isEnableFetching ? t('Searching') : t('Search')}
              </Button>
              <Button type='button' variant='tonal' color='secondary' onClick={handleClear}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default LeaveTypeSearchFilter
