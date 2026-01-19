// React Imports
import { useState } from 'react'

// MUI Imports
import { Grid } from '@mui/material'

// _template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// React Hook Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party Imports
import { useUpdateEffect } from 'react-use'

// Components Imports
import SkeletonCustom from '@/components/SkeletonCustom'

// _template Imports
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'

// Local Imports
import LeaveTypeSearchFilter from './LeaveTypeSearchFilter'
import LeaveTypeSearchResult from './LeaveTypeSearchResult'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'

const LeaveTypePage = () => {
  return (
    <DxProvider>
      <InnerApp />
    </DxProvider>
  )
}

const InnerApp = () => {
  // DxContext
  const { setIsEnableFetching } = useDxContext()

  // Setup Form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: async () => fetchDefaultValues(Number(MENU_ID))
  })

  const { control, getValues } = reactHookFormMethods

  const { isLoading: isLoadingReactHookForm } = useFormState({
    control: control
  })

  // Fetch data after initial form ready
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoadingReactHookForm])

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>

        {/* Search Filter Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <LeaveTypeSearchFilter />
              <DxWatchSearchFilters
                MENU_ID={Number(MENU_ID)}
                searchFiltersData={{
                  leaveTypeCode: getValues('searchFilters.leaveTypeCode'),
                  leaveTypeName: getValues('searchFilters.leaveTypeName'),
                  status: getValues('searchFilters.status')
                }}
              />
            </>
          )}
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <LeaveTypeSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default LeaveTypePage
