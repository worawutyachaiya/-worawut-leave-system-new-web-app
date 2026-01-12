// React Imports
import { useState } from 'react'

// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

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
import DocumentSearchFilter from './DocumentSearchFilter'
import DocumentSearchResult from './DocumentSearchResult'
import { fetchDefaultValues, FormDataPage, validationSchemaPage } from './validationSchema'
import { MENU_ID } from './env'

const DocumentPage = () => {
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

  const breadcrumbs = [
    <Typography key='1' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Home
    </Typography>,
    <Typography key='2' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      HR Setting
    </Typography>,
    <Typography key='3' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Document
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/*--------- Header Section ---------*/}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>Document</Typography>
          <Divider orientation='vertical' flexItem />
          <Breadcrumbs
            separator='›'
            aria-label='breadcrumb'
            sx={{
              display: 'inline-block'
            }}
          >
            {breadcrumbs}
          </Breadcrumbs>
        </Grid>

        {/*--------- Search Filter Section ---------*/}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? (
            <SkeletonCustom />
          ) : (
            <>
              <DocumentSearchFilter />
              <DxWatchSearchFilters
                MENU_ID={Number(MENU_ID)}
                searchFiltersData={{
                  documentName: getValues('searchFilters.documentName'),
                  status: getValues('searchFilters.status')
                }}
              />
            </>
          )}
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          {isLoadingReactHookForm ? <SkeletonCustom /> : <DocumentSearchResult />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default DocumentPage
