// MUI Imports
import { Button, Card, CardContent, CardHeader, Divider, Grid, CircularProgress } from '@mui/material'


// React Hook Form Imports
import { Controller, useFormContext } from 'react-hook-form'


// Components Imports
import SelectCustom from '@/components/react-select/SelectCustom'


// libs Imports
import { useCreate } from '@libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@utils/user-profile/userLoginProfile'


// Types
import { FormDataPage, statusOptions } from './validationSchema'
import { MENU_ID } from './env'


// Hooks
import { useGetDepartment } from '@/_workspace/react-query/hooks/useHrLeaveTypeRegulation'
import { fetchLeaveTypeAll } from '@/_workspace/react-select/async-promise-load-options/fetchLeaveTypeAll'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { useDxContext } from '@/_template/DxContextProvider'
import { useQueryClient } from '@tanstack/react-query'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useHrLeaveTypeRegulation'


const LeaveTypeSettingSearchFilter = () => {
  const { control, handleSubmit, setValue, getValues } = useFormContext<FormDataPage>()
  const { setIsEnableFetching, isEnableFetching } = useDxContext()
  const queryClient = useQueryClient()


  // Master Data
  const { data: departmentData } = useGetDepartment()
  const departmentOptions = departmentData?.data?.ResultOnDb?.map((item: any) => ({
    label: item.DEPARTMENT,
    value: item.DEPARTMENT
  })) || []

  // Save user profile settings
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          department: getValues('searchFilters.department'),
          leaveType: getValues('searchFilters.leaveType'),
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

  const onMutateSuccess = () => { }
  const onMutateError = (e: any) => {

  }

  const { mutate } = useCreate(onMutateSuccess, onMutateError)

  const onSubmit = (data: FormDataPage) => {
    setValue('submittedFilters', data.searchFilters)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const handleClear = () => {
    setValue('searchFilters', {
      department: null,
      leaveType: null,
      status: null
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  return (
    <Card sx={{ marginBottom: 4 }}>
      <CardHeader title='Search filters' titleTypographyProps={{ variant: 'h5' }} />
      <Divider />
      <CardContent>
        <Grid container spacing={4}>
          {/*------------ Department ------------------*/}
          <Grid item xs={12} md={4}>
            <Controller
              name='searchFilters.department'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <SelectCustom
                  {...field}
                  label='Department'
                  placeholder='Select department'
                  options={departmentOptions}
                  isClearable
                  classNamePrefix={'select'}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>

          {/*------------ Leave Type ------------------*/}
          <Grid item xs={12} md={4}>
            <Controller
              name='searchFilters.leaveType'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <AsyncSelectCustom
                  {...field}
                  label='Leave Type'
                  placeholder='Select leave type'
                  loadOptions={async (inputValue: string) => {
                    const data = await fetchLeaveTypeAll()
                    return data
                      .map((item: any) => ({
                        label: `${item.LEAVE_TYPE_DESCRIPTION_TH} / ${item.LEAVE_TYPE_DESCRIPTION_EN}`,
                        value: String(item.LEAVE_TYPE_ID),
                        ...item
                      }))
                      .filter((item: any) => item.label.toLowerCase().includes(inputValue.toLowerCase()))
                  }}
                  defaultOptions
                  isClearable
                  classNamePrefix={'select'}
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
                  classNamePrefix={'select'}
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
              Search
            </Button>
            <Button type='button' variant='tonal' color='secondary' onClick={handleClear}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default LeaveTypeSettingSearchFilter
