// MUI Imports
import Grid from '@mui/material/Grid'

// React Hook Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party Imports
import { useUpdateEffect } from 'react-use'

// Components Imports
import SkeletonCustom from '@/components/SkeletonCustom'

// _template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Local Imports
import { MENU_NAME, breadcrumbNavigation } from './env'
import { FormDataPage, validationSchemaPage } from './validationSchema'
import LeaveRequestEmployeeInfo from './LeaveRequestEmployeeInfo'
import LeaveRequestForm from './LeaveRequestForm'

const LeaveRequestPage = () => {
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: {}
  })

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>

        {/* Employee Info Section */}
        <Grid item xs={12}>
          <LeaveRequestEmployeeInfo />
        </Grid>

        {/* Form Section */}
        <Grid item xs={12}>
          {isLoading ? <SkeletonCustom /> : <LeaveRequestForm />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default LeaveRequestPage
