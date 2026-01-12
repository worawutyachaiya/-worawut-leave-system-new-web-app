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
import LeaveTypeSettingSearchFilter from './LeaveTypeSettingSearchFilter'
import LeaveTypeSettingSearchResult from './LeaveTypeSettingSearchResult'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import { MENU_ID } from './env'

const LeaveTypeSettingPage = () => {
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
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DxBreadCrumbs
            menuName='Leave Type'
            breadcrumbNavigation={[
              { menuName: 'Home' },
              { menuName: 'HR Setting' },
              { menuName: 'Leave Type' }
            ]}
          />
        </Grid>

        {/* Search Filter Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <LeaveTypeSettingSearchFilter />
              <DxWatchSearchFilters
                MENU_ID={Number(MENU_ID)}
                searchFiltersData={{
                  department: getValues('searchFilters.department')?.value || null,
                  leaveType: getValues('searchFilters.leaveType')?.value || null,
                  status: getValues('searchFilters.status')?.value || null
                }}
              />
            </>
          )}
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <LeaveTypeSettingSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default LeaveTypeSettingPage
