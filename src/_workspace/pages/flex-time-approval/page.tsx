import Grid from '@mui/material/Grid'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import FlexTimeApprovalSearchFilter from './FlexTimeApprovalSearchFilter'
import FlexTimeApprovalSearchResult from './FlexTimeApprovalSearchResult'
import { FormDataPage, validationSchemaPage, fetchDefaultValues } from './validationSchema'
import { MENU_ID, MENU_NAME, breadcrumbNavigation } from './env'
const FlexTimeApproval = () => {
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
    <>
      <Grid container spacing={6}>
        <FormProvider {...reactHookFormMethods}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            {isLoadingReactHookForm === false && (
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  employeeName: getValues('searchFilters.employeeName'),
                  employeeCode: getValues('searchFilters.employeeCode'),
                  section: getValues('searchFilters.section')
                }}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <FlexTimeApprovalSearchFilter />
          </Grid>
          <Grid item xs={12}>
            {isLoadingReactHookForm ? <SkeletonCustom /> : <FlexTimeApprovalSearchResult />}
          </Grid>
        </FormProvider>
      </Grid>
    </>
  )
}
export default FlexTimeApproval
