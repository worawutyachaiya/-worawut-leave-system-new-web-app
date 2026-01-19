// MUI Imports
import { Grid } from '@mui/material'

// React Hook Form Imports
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components Imports
import SkeletonCustom from '@/components/SkeletonCustom'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
//env
import { breadcrumbNavigation, MENU_NAME } from './env'
// Local Imports
import { FormDataPage, validationSchemaPage, defaultValues } from './validationSchema'
import M75Form from './M75Form'

const M75Page = () => {
  // Setup Form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues
  })

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>

        {/* Request Leave Form Section */}
        <Grid item xs={12}>
          <M75Form />
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default M75Page
