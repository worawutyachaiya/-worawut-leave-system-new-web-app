import { useState } from 'react'
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import RemainLeaveSearchFilter from './RemainLeaveSearchFilter'
import RemainLeaveSearchResult from './RemainLeaveSearchResult'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
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
    defaultValues: async () => fetchDefaultValues(MENU_ID)
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
      Remain Leave
    </Typography>
  ]
  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>
        {/* ----------------- Search Filter Section ----------------- */}
        <Grid item xs={12}>
          {/* แสดง Skeleton ระหว่างรอ Form โหลด (ถ้าจำเป็น) หรือแสดงเลย */}
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <RemainLeaveSearchFilter />
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  employeeName: getValues('searchFilters.employeeName'),
                  employeeCode: getValues('searchFilters.employeeCode'),
                  section: getValues('searchFilters.section')
                }}
              />
            </>
          )}
        </Grid>
        {/* ----------------- Result Table Section ----------------- */}
        <Grid item xs={12}>
          {/* เช็ค isLoading เพื่อกันการ render ตารางก่อน form พร้อม */}
          {isLoadingReactHookForm ? <SkeletonCustom /> : <RemainLeaveSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default LeaveRequest
