// MUI Imports
import { Breadcrumbs, Divider, Grid, Typography } from '@mui/material'

// Components Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Local Imports
import { MENU_NAME } from './env'
import ExcelForm from './ExcelForm'

const ExcelFormPage = () => {
  const breadcrumbs = [
    <Typography key='1' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Home
    </Typography>,
    <Typography key='2' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      {MENU_NAME}
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      {/* Header Section */}
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Typography variant='h4'>{MENU_NAME}</Typography>
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

      {/* Excel Form Section */}
      <Grid item xs={12}>
        <ExcelForm />
      </Grid>
    </Grid>
  )
}

export default ExcelFormPage
