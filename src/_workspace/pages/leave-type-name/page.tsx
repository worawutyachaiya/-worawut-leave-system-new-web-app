import { Grid } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import LeaveTypeSettingSearchFilter from './LeaveTypeSettingSearchFilter'
import LeaveTypeSettingSearchResult from './LeaveTypeSettingSearchResult'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import { MENU_ID, MENU_NAME, breadcrumbNavigation } from './env'
const LeaveTypeSetting = () => {
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
  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* ------------- Header Section ------------- */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DxBreadCrumbs
            menuName={MENU_NAME}
            breadcrumbNavigation={breadcrumbNavigation}
          />
        </Grid>
        {/* ------------- Search Filter Section ------------- */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <LeaveTypeSettingSearchFilter />
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  leaveTypeCode: getValues('searchFilters.leaveTypeCode'),
                  leaveTypeDescription: getValues('searchFilters.leaveTypeDescription'),
                  status: getValues('searchFilters.status')
                }}
              />
            </>
          )}
        </Grid>
        {/* ------------- Result Table Section ------------- */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <LeaveTypeSettingSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default LeaveTypeSetting
