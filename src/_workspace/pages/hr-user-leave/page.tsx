// React Imports
import { useEffect } from 'react'

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
import UserLeaveSearchFilter from './UserLeaveSearchFilter'
import UserLeaveSearchResult from './UserLeaveSearchResult'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'

const UserLeavePage = () => {
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
              <UserLeaveSearchFilter />
              <DxWatchSearchFilters
                MENU_ID={Number(MENU_ID)}
                searchFiltersData={{
                  employeecode: getValues('searchFilters.employeeCode')?.EMPLOYEE_CODE || null,
                  employeeName: getValues('searchFilters.employeeName') || null,
                  section: getValues('searchFilters.section')?.SECTION || null
                }}
              />
            </>
          )}
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <UserLeaveSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default UserLeavePage
