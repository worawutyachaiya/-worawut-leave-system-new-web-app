import Grid from '@mui/material/Grid'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { MENU_NAME, breadcrumbNavigation } from './env'
import EmailSettingForm from './EmailSettingForm'

const EmailSettingPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
      </Grid>
      <Grid item xs={12}>
        <EmailSettingForm />
      </Grid>
    </Grid>
  )
}

export default EmailSettingPage
