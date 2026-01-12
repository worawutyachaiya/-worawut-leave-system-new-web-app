import Grid from '@mui/material/Grid'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'
import EditUserFlexTimeSearchFilter from './EditUserFlexTimeSearchFilter'
import EditUserFlexTimeSearchResult from './EditUserFlexTimeSearchResult'
import type { FormDataPage } from './validationSchema'
import { fetchDefaultValues, validationSchemaPage } from './validationSchema'
function Page() {
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
  const { isLoading: isLoadingReactHookForm } = useFormState({ control })
  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoadingReactHookForm])
  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
          {!isLoadingReactHookForm && (
            <DxWatchSearchFilters
              MENU_ID={MENU_ID}
              searchFiltersData={{
                employeeCode: getValues('searchFilters.employeeCode') || '',
                employeeName: getValues('searchFilters.employeeName') || '',
                section: getValues('searchFilters.section') || null
              }}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <EditUserFlexTimeSearchFilter />}
        </Grid>
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <EditUserFlexTimeSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default Page
