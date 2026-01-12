import Grid from '@mui/material/Grid'
import FlexTimeRequestCalendar from './FlexTimeRequestCalendar'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { MENU_NAME, breadcrumbNavigation } from './env'
const FlexTimeRequestPage = () => {
  return (
    <Grid container spacing={6}>
      {/* Header Section */}
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
      </Grid>
      {/* Calendar Section */}
      <Grid item xs={12}>
        <FlexTimeRequestCalendar />
      </Grid>
    </Grid>
  )
}
export default FlexTimeRequestPage
