import { useState } from 'react'
import { Breadcrumbs, Divider, Grid, Typography, Card, CardContent, Box, Alert } from '@mui/material'
import SkeletonCustom from '@/components/SkeletonCustom'
import LeaveDocsNav from './LeaveDocsNav'
import LeaveDocsPane from './LeaveDocsPane'
import { useGetLeaveDocuments } from '@/_workspace/react-query/hooks/useLeaveDocument'
import type { LeaveDocumentData } from '@/_workspace/types/leave-document/LeaveDocumentInterface'
import { breadcrumbNavigation, MENU_NAME } from './env'
import { useTranslation } from '@/contexts/TranslationContext'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
const LeaveDocument = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)
  const { data: documentsData, isLoading, error } = useGetLeaveDocuments()
  const documents: LeaveDocumentData[] = documentsData?.data?.ResultOnDb
    ? [...documentsData.data.ResultOnDb].sort((a, b) => {
        const nameA = a.LEAVE_REGULARITY_FILE_NAME
        const nameB = b.LEAVE_REGULARITY_FILE_NAME
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      })
    : []
  const currentDocument = documents[activeTab] || null
  const breadcrumbs = breadcrumbNavigation.map((item, index) => (
    <Typography key={index} sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      {item.menuName}
    </Typography>
  ))
  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>{MENU_NAME}</Typography>
          <Divider orientation='vertical' flexItem />
          <Breadcrumbs separator='›' aria-label='breadcrumb'>
            {breadcrumbs}
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12}>
          <SkeletonCustom />
        </Grid>
      </Grid>
    )
  }
  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>{MENU_NAME}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Alert severity='error'>{t('Unable to load data. Please try again.')}</Alert>
        </Grid>
      </Grid>
    )
  }
  if (documents.length === 0) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>{MENU_NAME}</Typography>
          <Divider orientation='vertical' flexItem />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant='h6' color='text.secondary'>
                  {t('No documents found')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
  return (
    <Grid container spacing={6}>
      {/* Header Section */}
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
      </Grid>
      {/* Content Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Navigation Tabs - Left Side */}
              <Grid item xs={12} md={3}>
                <LeaveDocsNav documents={documents} activeTab={activeTab} isLoading={isLoading} />
              </Grid>
              {/* Document Viewer - Right Side */}
              <Grid item xs={12} md={9}>
                <LeaveDocsPane document={currentDocument} tabIndex={activeTab} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
export default LeaveDocument
