import Grid from '@mui/material/Grid'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SkeletonCustom from '@/components/SkeletonCustom'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { MENU_NAME, breadcrumbNavigation } from './env'
import { FormDataPage, validationSchemaPage } from './validationSchema'
import TimeRecordRequestForm from './TimeRecordRequestForm'
const TimeRecordRequestPage = () => {
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: {
      formData: {
        timeIn: '',
        timeOut: '',
        dateIn: '',
        dateOut: '',
        timeRecordType: null as any,
        reason: ''
      }
    }
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
        {/* Form Section */}
        <Grid item xs={12}>
          {isLoading ? <SkeletonCustom /> : <TimeRecordRequestForm />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}
export default TimeRecordRequestPage
