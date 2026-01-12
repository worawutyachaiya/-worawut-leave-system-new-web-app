import { useState } from 'react'
import { Grid, Box } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'
import SkeletonCustom from '@/components/SkeletonCustom'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import DxWatchSearchFilters from '@/_template/DxWatchSearchFilters'
import ViewToggle from './ViewToggle'
import SubordinateTimeRecordTableSearchFilters from './TableView/SubordinateTimeRecordTableSearchFilters'
import SubordinateTimeRecordTableSearchResult from './TableView/SubordinateTimeRecordTableSearchResult'
import { breadcrumbNavigation, MENU_ID, MENU_NAME } from './env'
import type { FormDataPage } from './validationSchema'
import { fetchDefaultValues, validationSchemaPage } from './validationSchema'
import type { ViewType } from '@/_workspace/types/check-subordinate-time-record/CheckSubordinateTimeRecordTypes'

function Page() {
  return (
    <DxProvider>
      <InnerApp />
    </DxProvider>
  )
}

const InnerApp = () => {
  const { setIsEnableFetching } = useDxContext()
  const [activeView, setActiveView] = useState<ViewType>('table')
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

  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
  }

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            {isLoadingReactHookForm === false && (
              <DxWatchSearchFilters
                MENU_ID={MENU_ID}
                searchFiltersData={{
                  employeeCode: getValues('searchFilters.employeeCode'),
                  tableEmployeeCode: getValues('searchFilters.tableEmployeeCode'),
                  tableEmployeeName: getValues('searchFilters.tableEmployeeName'),
                  tableSection: getValues('searchFilters.tableSection')
                }}
              />
            )}
          </Box>
          <ViewToggle activeView={activeView} onViewChange={handleViewChange} />
        </Grid>
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <TableContent />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

const TableContent = () => {
  return (
    <>
      <SubordinateTimeRecordTableSearchFilters />
      <SubordinateTimeRecordTableSearchResult />
    </>
  )
}

export default Page
