import { useState } from 'react'
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import LeaveApprovalSearchFilter from './LeaveApprovalSearchFilter'
import LeaveApprovalSearchResult from './LeaveApprovalSearchResult'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import { MENU_ID } from './env'
const LeaveRequest = () => {
  return (
    <DxProvider>
      <InnerApp />
    </DxProvider>
  )
}
const InnerApp = () => {
  const { setIsEnableFetching } = useDxContext()
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: async () => fetchDefaultValues(Number(MENU_ID))
  })
  const { control, getValues } = reactHookFormMethods
  const { isLoading: isLoadingReactHookForm } = useFormState({
    control: control
  })
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoadingReactHookForm])
  const breadcrumbs = [
    <Typography key='1' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Home
    </Typography>,
    <Typography key='2' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Leave Approval
    </Typography>
  ]
  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>Leave Approval</Typography>
          <Divider orientation='vertical' flexItem />
          <Breadcrumbs separator='›' aria-label='breadcrumb' sx={{ display: 'inline-block' }}>
            {breadcrumbs}
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <LeaveApprovalSearchFilter />{' '}
              <DxWatchSearchFilters
                MENU_ID={Number(MENU_ID)}
                searchFiltersData={{
                  employeeCode: getValues('searchFilters.employeeCode'),
                  employeeName: getValues('searchFilters.employeeName'),
                  section: getValues('searchFilters.section')
                }}
              />
            </>
          )}
        </Grid>
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <LeaveApprovalSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default LeaveRequest
