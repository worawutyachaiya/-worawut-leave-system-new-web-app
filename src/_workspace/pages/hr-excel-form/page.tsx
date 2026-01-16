// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Local Imports
import { MENU_NAME } from './env'
import ExcelForm from './ExcelForm'
import { breadcrumbNavigation } from './env'

const ExcelFormPage = () => {
  return (
    <Grid container spacing={6}>
      {/* Header Section */}
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
      </Grid>

      {/* Excel Form Section */}
      <Grid item xs={12}>
        <ExcelForm />
      </Grid>
    </Grid>
  )
}

export default ExcelFormPage
