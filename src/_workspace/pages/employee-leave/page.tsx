import { useState } from 'react'
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
import SkeletonCustom from '@/components/SkeletonCustom'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import EmployeeLeaveSearchFilters from './EmployeeLeaveSearchFilter'
import SearchEmployeeLeaveTable from './EmployeeLeaveSearchResult'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'
import { useTranslation } from '@/contexts/TranslationContext'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
const LeaveRequest = () => {
  return (
    <DxProvider>
      <InnerApp />
    </DxProvider>
  )
}
const InnerApp = () => {
  const { t } = useTranslation()
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
      Employee Leave
    </Typography>
  ]
  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>
        {/* Search Section */}
        <Grid item xs={12}>
          {/* <LeaveRequestEmployeeInfo setIsEnableFetching={setIsEnableFetching} /> */}
        </Grid>
        {/* Table Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <EmployeeLeaveSearchFilters />
              <DxWatchSearchFilters
                MENU_ID={Number(MENU_ID)}
                searchFiltersData={{
                  leaveType: getValues('searchFilters.leaveType'),
                  startDate: getValues('searchFilters.startDate'),
                  endDate: getValues('searchFilters.endDate'),
                  timeLeave: getValues('searchFilters.timeLeave'),
                  total: getValues('searchFilters.total'),
                  employeeCode: getValues('searchFilters.employeeCode'),
                  employeeName: getValues('searchFilters.employeeName'),
                  department: getValues('searchFilters.department'),
                  section: getValues('searchFilters.section')
                }}
              />
            </>
          )}
        </Grid>
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <SearchEmployeeLeaveTable />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default LeaveRequest
