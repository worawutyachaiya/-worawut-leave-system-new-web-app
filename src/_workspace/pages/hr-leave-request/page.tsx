// React Imports

// MUI Imports
import { Grid } from '@mui/material'

// _template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// React Hook Form Imports
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Components Imports
import HrFormEmployeeInfo from './HrFormEmployeeInfo'
import RequestLeaveFormHr from './HrFormRequestLeave'
// Types and Validation Imports
import { FormDataPage, validationSchemaPage, defaultValues } from './validationSchema'

// Environment
import { MENU_NAME } from './env'

const LeaveRequestFormHr = () => {
  // no API
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues
  })

  // Watch employee code to prevent flicker
  const employeeCode = reactHookFormMethods.watch('requestLeaveForm.EMPLOYEE_CODE')?.EMPLOYEE_CODE || ''

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        {/* Header Section */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DxBreadCrumbs
            menuName={MENU_NAME}
            breadcrumbNavigation={[
              { menuName: 'Home' },
              { menuName: MENU_NAME }
            ]}
          />
        </Grid>
        {/* Employee Remain Leave Section */}
        <Grid item xs={12}>
          <HrFormEmployeeInfo EMPLOYEE_CODE={employeeCode} />
        </Grid>
        {/* Request Leave Form Section */}
        <Grid item xs={12}>
          <RequestLeaveFormHr />
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default LeaveRequestFormHr
