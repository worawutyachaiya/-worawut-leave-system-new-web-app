import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import HrcheckM75SearchFilter from './HrcheckM75SearchFilter'
import HrcheckM75SearchResult from './HrcheckM75SearchResult'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import { FormDataPage, validationSchemaPage, fetchDefaultValues } from './ValidationSchema'
import { MENU_NAME, MENU_ID, breadcrumbNavigation } from './env'
const HrLeaveM75 = () => {
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
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>{MENU_NAME}</Typography>
          <Divider orientation='vertical' flexItem />
          <Breadcrumbs separator='›' aria-label='breadcrumb' sx={{ display: 'inline-block' }}>
            {breadcrumbs}
          </Breadcrumbs>
        </Grid>
        {/* Search Filter Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <HrcheckM75SearchFilter setIsEnableFetching={setIsEnableFetching} />
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  employeeCode: getValues('searchFilters.employeeCode'),
                  leaveType: getValues('searchFilters.leaveType'),
                  startDate: getValues('searchFilters.startDate'),
                  endDate: getValues('searchFilters.endDate'),
                  status: getValues('searchFilters.status')
                }}
              />
            </>
          )}
        </Grid>
        {/* Table Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <HrcheckM75SearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default HrLeaveM75
