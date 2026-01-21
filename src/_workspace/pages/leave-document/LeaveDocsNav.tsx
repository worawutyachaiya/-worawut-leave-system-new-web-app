import { Dispatch, SetStateAction } from 'react'
import { Box, Tab, Tabs, Typography, CircularProgress, Paper } from '@mui/material'
import type { LeaveDocumentData } from '@/_workspace/types/leave-document/LeaveDocumentInterface'
import { useTranslation } from '@/contexts/TranslationContext'
interface LeaveDocsNavProps {
  documents: LeaveDocumentData[]
  activeTab: number
  isLoading: boolean
}
const LeaveDocsNav = ({ documents, activeTab, isLoading }: LeaveDocsNavProps) => {
  const { t } = useTranslation()
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }
  return (
    <Paper elevation={0} sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}>
      <Tabs
        orientation='vertical'
        variant='scrollable'
        value={activeTab}
        aria-label='Leave Document Tabs'
        sx={{
          '& .MuiTab-root': {
            alignItems: 'flex-start',
            textAlign: 'left',
            minHeight: 48,
            py: 1.5,
            px: 4.5
          },
          '& .MuiTabs-indicator': {
            left: 0,
            right: 'auto'
          }
        }}
      >
        {documents.map((doc, index) => (
          <Tab
            key={doc.LEAVE_REGULARITY_ID}
            label={
              <Typography variant='body2' fontWeight={activeTab === index ? 600 : 400} fontSize={16}>
                {t(doc.LEAVE_REGULARITY_NAME)}
              </Typography>
            }
            id={`leave-doc-tab-${index}`}
            aria-controls={`leave-doc-tabpanel-${index}`}
          />
        ))}
      </Tabs>
    </Paper>
  )
}
export default LeaveDocsNav
