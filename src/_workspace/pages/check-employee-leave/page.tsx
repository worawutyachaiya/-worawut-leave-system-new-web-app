import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import HrCheckerSearchFilter from './HrCheckerSearchFilter'
import HrCheckerSearchResult from './HrCheckerSearchResult'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import { MENU_ID, MENU_NAME, breadcrumbNavigation } from './env'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
const HrChecker = () => {
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
  const breadcrumbs = breadcrumbNavigation.map((item, index) => (
    <Typography
      key={index}
      sx={{
        color:
          index === breadcrumbNavigation.length - 1
            ? 'var(--mui-palette-text-primary) !important'
            : 'var(--mui-palette-text-secondary) !important'
      }}
    >
      {item.menuName}
    </Typography>
  ))
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
              <HrCheckerSearchFilter />
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  employeeCode: getValues('searchFilters.employeeCode'),
                  leaveType: getValues('searchFilters.leaveType'),
                  startDate: getValues('searchFilters.startDate'),
                  endDate: getValues('searchFilters.endDate'),
                  status: getValues('searchFilters.status'),
                  statusForApprove: getValues('searchFilters.approveStatus')
                }}
              />
            </>
          )}
        </Grid>
        {/* Result Table Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <HrCheckerSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default HrChecker
